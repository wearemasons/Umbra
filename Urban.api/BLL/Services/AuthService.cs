using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using DAL.Models;
using DAL.Data.Contexts;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace BLL.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(string username, string password, string fullName);
        Task<string?> LoginAsync(string username, string password);
        Task<User?> GetUserByIdAsync(Guid userId);
        Task<User?> GetUserByUsernameAsync(string username);
    }

    public class AuthService : IAuthService
    {
        private readonly UrbanContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(UrbanContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> RegisterAsync(string username, string password, string fullName)
        {
            // Check if user already exists
            if (await GetUserByUsernameAsync(username) != null)
            {
                throw new InvalidOperationException("User with this username already exists");
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

            // Create user
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username.ToLowerInvariant(),
                PasswordHash = passwordHash,
                FullName = fullName,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate JWT token
            return GenerateJwtToken(user);
        }

        public async Task<string?> LoginAsync(string username, string password)
        {
            var user = await GetUserByUsernameAsync(username);
            if (user == null)
            {
                return null;
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return null;
            }

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generate JWT token
            return GenerateJwtToken(user);
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username.ToLowerInvariant());
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? "your-super-secret-key-that-is-at-least-32-characters-long";
            var issuer = jwtSettings["Issuer"] ?? "UrbanAPI";
            var audience = jwtSettings["Audience"] ?? "UrbanAPI";
            var expiryHours = int.Parse(jwtSettings["ExpiryHours"] ?? "24");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim("username", user.Username),
                new Claim("userId", user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiryHours),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
