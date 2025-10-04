using Microsoft.EntityFrameworkCore;
using DAL.Models;
using DAL.Data.Contexts;

namespace BLL.Services
{
    public class MessageService : IMessageService
    {
        private readonly UrbanContext _context;

        public MessageService(UrbanContext context)
        {
            _context = context;
        }

        public async Task<Message> SendMessageAsync(Guid chatId, string content, Guid userId)
        {
            // Verify chat belongs to user
            var chat = await _context.Chats
                .FirstOrDefaultAsync(c => c.Id == chatId && c.UserId == userId);

            if (chat == null)
            {
                throw new UnauthorizedAccessException("Chat not found or access denied");
            }

            var message = new Message
            {
                Id = Guid.NewGuid(),
                ChatId = chatId,
                Content = content,
                Role = MessageRole.User,
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);

            // Update chat's UpdatedAt timestamp
            chat.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return message;
        }

        public async Task<List<Message>> GetChatMessagesAsync(Guid chatId, Guid userId)
        {
            // Verify chat belongs to user
            var chat = await _context.Chats
                .FirstOrDefaultAsync(c => c.Id == chatId && c.UserId == userId);

            if (chat == null)
            {
                throw new UnauthorizedAccessException("Chat not found or access denied");
            }

            return await _context.Messages
                .Where(m => m.ChatId == chatId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<Message> GenerateAIResponseAsync(Guid chatId, string userMessage, Guid userId)
        {
            // Send the user message first
            var userMsg = await SendMessageAsync(chatId, userMessage, userId);

            // Generate AI response based on the user message and chat context
            var aiResponse = await GenerateContextualResponse(chatId, userMessage, userId);

            // Create AI message directly with proper role
            var aiMessage = new Message
            {
                Id = Guid.NewGuid(),
                ChatId = chatId,
                Content = aiResponse,
                Role = MessageRole.Assistant,
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(aiMessage);

            // Update chat's UpdatedAt timestamp
            var chat = await _context.Chats.FindAsync(chatId);
            if (chat != null)
            {
                chat.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return aiMessage;
        }

        public async Task<Chat> GetChatWithMessagesAsync(Guid chatId, Guid userId)
        {
            var chat = await _context.Chats
                .Where(c => c.Id == chatId && c.UserId == userId)
                .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
                .Include(c => c.ChatPublications)
                    .ThenInclude(cp => cp.Publication)
                .FirstOrDefaultAsync();

            if (chat == null)
            {
                throw new UnauthorizedAccessException("Chat not found or access denied");
            }

            return chat;
        }

        public async Task<List<Chat>> GetUserChatsAsync(Guid userId)
        {
            return await _context.Chats
                .Where(c => c.UserId == userId)
                .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
                .Include(c => c.ChatPublications)
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync();
        }

        private async Task<string> GenerateContextualResponse(Guid chatId, string userMessage, Guid userId)
        {
            // Get chat context (previous messages and publications)
            var chat = await _context.Chats
                .Where(c => c.Id == chatId && c.UserId == userId)
                .Include(c => c.Messages.OrderBy(m => m.CreatedAt).Take(10))
                .Include(c => c.ChatPublications)
                    .ThenInclude(cp => cp.Publication)
                .FirstOrDefaultAsync();

            if (chat == null)
            {
                return "I'm sorry, I couldn't find the chat context.";
            }

            // Build context from recent messages
            var recentMessages = chat.Messages.TakeLast(5).ToList();
            var contextMessages = string.Join("\n", recentMessages.Select(m => $"{m.Role}: {m.Content}"));

            // Get publication context
            var publications = chat.ChatPublications.Select(cp => cp.Publication).ToList();
            var publicationContext = publications.Any() 
                ? $"\n\nRelevant Publications:\n{string.Join("\n", publications.Select(p => $"- {p.Title} by {string.Join(", ", p.Authors)}"))}"
                : "";

            // Generate response based on context
            var response = GenerateResponse(userMessage, contextMessages, publicationContext);

            return response;
        }

        private string GenerateResponse(string userMessage, string contextMessages, string publicationContext)
        {
            // Simple AI response generation (in a real app, you'd integrate with OpenAI, Claude, etc.)
            var lowerMessage = userMessage.ToLower();

            if (lowerMessage.Contains("hello") || lowerMessage.Contains("hi"))
            {
                return "Hello! I'm here to help you with your research questions. How can I assist you today?";
            }
            else if (lowerMessage.Contains("urban") || lowerMessage.Contains("planning"))
            {
                return "Urban planning is a fascinating field! It involves designing and managing the development of cities and communities. " +
                       "Key aspects include land use planning, transportation systems, environmental sustainability, and social equity. " +
                       "Is there a specific aspect of urban planning you'd like to explore further?";
            }
            else if (lowerMessage.Contains("research") || lowerMessage.Contains("study"))
            {
                return "Research is crucial for evidence-based urban planning. It helps us understand community needs, " +
                       "assess the impact of development projects, and create more effective policies. " +
                       "What specific research topic interests you?";
            }
            else if (lowerMessage.Contains("sustainability") || lowerMessage.Contains("environment"))
            {
                return "Sustainable urban development focuses on creating cities that meet present needs without compromising future generations. " +
                       "This includes green infrastructure, renewable energy, waste reduction, and biodiversity conservation. " +
                       "Would you like to discuss specific sustainability strategies?";
            }
            else if (lowerMessage.Contains("transportation") || lowerMessage.Contains("mobility"))
            {
                return "Transportation planning is essential for creating accessible and efficient cities. " +
                       "Modern approaches include public transit, cycling infrastructure, pedestrian-friendly design, " +
                       "and smart mobility solutions. What transportation challenges are you interested in?";
            }
            else if (publicationContext.Length > 0)
            {
                return $"Based on the publications in this chat, I can help you explore topics related to the research papers you've referenced. " +
                       $"{publicationContext}\n\nWhat specific questions do you have about these research areas?";
            }
            else
            {
                return "That's an interesting question! I'd be happy to help you explore this topic further. " +
                       "Could you provide more details about what specific aspect you'd like to discuss? " +
                       "I can help with topics related to urban planning, research methodologies, sustainability, and more.";
            }
        }
    }
}
