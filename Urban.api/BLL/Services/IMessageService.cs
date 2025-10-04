using DAL.Models;

namespace BLL.Services
{
    public interface IMessageService
    {
        Task<Message> SendMessageAsync(Guid chatId, string content, Guid userId);
        Task<List<Message>> GetChatMessagesAsync(Guid chatId, Guid userId);
        Task<Message> GenerateAIResponseAsync(Guid chatId, string userMessage, Guid userId);
        Task<Chat> GetChatWithMessagesAsync(Guid chatId, Guid userId);
        Task<List<Chat>> GetUserChatsAsync(Guid userId);
    }
}
