using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DAL.Data.Contexts;
using DAL.Models;
using System.Security.Claims;
using BLL.Services;

namespace Urban.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly UrbanContext _context;
        private readonly IMessageService _messageService;

        public ChatController(UrbanContext context, IMessageService messageService)
        {
            _context = context;
            _messageService = messageService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserChats()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var chats = await _messageService.GetUserChatsAsync(userId);

                var chatDtos = chats.Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.CreatedAt,
                    c.UpdatedAt,
                    MessageCount = c.Messages.Count,
                    PublicationCount = c.ChatPublications.Count,
                    LastMessage = c.Messages.FirstOrDefault()?.Content,
                    Publications = c.ChatPublications.Select(cp => new
                    {
                        cp.Publication.Id,
                        cp.Publication.Title,
                        cp.Publication.Authors,
                        cp.AddedAt
                    })
                });

                return Ok(chatDtos);
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving chats" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateChat([FromBody] CreateChatRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var chat = new Chat
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Title = request.Title,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Chats.Add(chat);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetChat), new { id = chat.Id }, new
                {
                    chat.Id,
                    chat.Title,
                    chat.CreatedAt,
                    chat.UpdatedAt
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while creating chat" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetChat(Guid id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var chat = await _messageService.GetChatWithMessagesAsync(id, userId);

                var chatDto = new
                {
                    chat.Id,
                    chat.Title,
                    chat.CreatedAt,
                    chat.UpdatedAt,
                    Messages = chat.Messages.Select(m => new
                    {
                        m.Id,
                        m.Content,
                        m.Role,
                        m.CreatedAt
                    }),
                    Publications = chat.ChatPublications.Select(cp => new
                    {
                        cp.Publication.Id,
                        cp.Publication.Title,
                        cp.Publication.Authors,
                        cp.Publication.Abstract,
                        cp.AddedAt
                    })
                };

                return Ok(chatDto);
            }
            catch (UnauthorizedAccessException)
            {
                return NotFound(new { Message = "Chat not found" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving chat" });
            }
        }

        [HttpPost("{id}/messages")]
        public async Task<IActionResult> AddMessage(Guid id, [FromBody] AddMessageRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var message = await _messageService.SendMessageAsync(id, request.Content, userId);

                return Ok(new
                {
                    message.Id,
                    message.Content,
                    message.CreatedAt
                });
            }
            catch (UnauthorizedAccessException)
            {
                return NotFound(new { Message = "Chat not found" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while adding message" });
            }
        }

        [HttpPost("{id}/send")]
        public async Task<IActionResult> SendMessageWithResponse(Guid id, [FromBody] SendMessageRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var aiMessage = await _messageService.GenerateAIResponseAsync(id, request.Message, userId);

                return Ok(new
                {
                    UserMessage = request.Message,
                    AIResponse = new
                    {
                        aiMessage.Id,
                        aiMessage.Content,
                        aiMessage.Role,
                        aiMessage.CreatedAt
                    }
                });
            }
            catch (UnauthorizedAccessException)
            {
                return NotFound(new { Message = "Chat not found" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while processing message" });
            }
        }

        [HttpPost("{id}/publications")]
        public async Task<IActionResult> AddPublicationToChat(Guid id, [FromBody] AddPublicationRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var chat = await _context.Chats
                    .Where(c => c.Id == id && c.UserId == userId)
                    .FirstOrDefaultAsync();

                if (chat == null)
                {
                    return NotFound(new { Message = "Chat not found" });
                }

                var publication = await _context.Publications
                    .FirstOrDefaultAsync(p => p.Id == request.PublicationId);

                if (publication == null)
                {
                    return NotFound(new { Message = "Publication not found" });
                }

                // Check if publication is already added to this chat
                var existingChatPublication = await _context.ChatPublications
                    .FirstOrDefaultAsync(cp => cp.ChatId == id && cp.PublicationId == request.PublicationId);

                if (existingChatPublication != null)
                {
                    return BadRequest(new { Message = "Publication already added to this chat" });
                }

                var chatPublication = new ChatPublication
                {
                    Id = Guid.NewGuid(),
                    ChatId = id,
                    PublicationId = request.PublicationId,
                    AddedAt = DateTime.UtcNow
                };

                _context.ChatPublications.Add(chatPublication);
                
                // Update chat's UpdatedAt
                chat.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    chatPublication.Id,
                    Publication = new
                    {
                        publication.Id,
                        publication.Title,
                        publication.Authors,
                        publication.Abstract
                    },
                    chatPublication.AddedAt
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while adding publication to chat" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChat(Guid id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var chat = await _context.Chats
                    .Where(c => c.Id == id && c.UserId == userId)
                    .FirstOrDefaultAsync();

                if (chat == null)
                {
                    return NotFound(new { Message = "Chat not found" });
                }

                _context.Chats.Remove(chat);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while deleting chat" });
            }
        }

    }

    public class CreateChatRequest
    {
        public string Title { get; set; } = string.Empty;
    }

    public class AddMessageRequest
    {
        public string Content { get; set; } = string.Empty;
        //public MessageRole Role { get; set; } = MessageRole.User;
    }

    public class AddPublicationRequest
    {
        public Guid PublicationId { get; set; }
    }

    public class SendMessageRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}
