using Microsoft.AspNetCore.Mvc;
using BLL.Services;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace Urban.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var token = await _authService.RegisterAsync(request.Username, request.Password, request.FullName);

                return Ok(new { Token = token, Message = "User registered successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred during registration" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var token = await _authService.LoginAsync(request.Username, request.Password);

                if (token == null)
                {
                    return Unauthorized(new { Message = "Invalid username or password" });
                }

                return Ok(new { Token = token, Message = "Login successful" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred during login" });
            }
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found" });
                }

                return Ok(new
                {
                    Id = user.Id,
                    Username = user.Username,
                    FullName = user.FullName,
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving user information" });
            }
        }
    }
    
}
    

        public class RegisterRequest
        {
            [Required, MinLength(3), MaxLength(50)]
            public string Username { get; set; } = string.Empty;

            [Required, MinLength(6)]
            public string Password { get; set; } = string.Empty;

            [Required, MinLength(2)]
            public string FullName { get; set; } = string.Empty;
        }

        public class LoginRequest
        {
            [Required, MinLength(3), MaxLength(50)]
            public string Username { get; set; } = string.Empty;

            [Required]
            public string Password { get; set; } = string.Empty;
        }
    


