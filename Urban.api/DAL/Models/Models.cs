using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DAL.Models
{
    public class Publication
    {
        [Key]
        public Guid Id { get; set; }

        [Required, MaxLength(500)]
        public required string Title { get; set; }

        [Required, MinLength(1)]
        public List<string> Authors { get; set; } = new();

        [Required]
        public required string Abstract { get; set; }

        [Required, MaxLength(50)]
        public required string PublicationDate { get; set; } // Could be ISO string

        [Required, MaxLength(200)]
        public required string Doi { get; set; }

        [Required, Url, MaxLength(500)]
        public required string PdfUrl { get; set; }

        [MinLength(1)]
        public List<string> Keywords { get; set; } = new();

        [Required]
        public ProcessingStatus ProcessingStatus { get; set; }

        [Range(0, int.MaxValue)]
        public int CitationCount { get; set; }

        [Range(0, int.MaxValue)]
        public int ViewCount { get; set; }

        // Extracted entities (optional)
        public List<string>? Organisms { get; set; }
        public List<string>? ExperimentalConditions { get; set; }
        public List<string>? BiologicalProcesses { get; set; }
        public List<string>? SpaceEnvironments { get; set; }
    }

    public enum ProcessingStatus
    {
        Pending,
        Processing,
        Completed,
        Failed
    }

    public class Embedding
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid PublicationId { get; set; }

        [Required, MaxLength(100)]
        public required string Section { get; set; } // e.g., title, abstract, methods

        [Required, MinLength(1)]
        public List<double> Vector { get; set; } = new();
    }

    public class SearchQuery
    {
        [Key]
        public Guid Id { get; set; }

        [Required, MaxLength(500)]
        public required string Query { get; set; }

        [Required]
        public required string SynthesizedAnswer { get; set; }

        [Range(0, long.MaxValue)]
        public long Timestamp { get; set; } // Unix timestamp
    }

    public class KnowledgeGraphNode
    {
        [Key]
        public Guid Id { get; set; }

        [Required, MaxLength(200)]
        public required string Label { get; set; }

        [Required, MaxLength(100)]
        public required string Type { get; set; } // e.g., organism, condition

        [Range(0, int.MaxValue)]
        public int Importance { get; set; }
    }

    public class KnowledgeGraphEdge
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid SourceNodeId { get; set; }

        [Required]
        public Guid TargetNodeId { get; set; }

        [Required, MaxLength(100)]
        public required string RelationshipType { get; set; }

        [Range(0.0, 1.0)]
        public double Confidence { get; set; }

        [MinLength(1)]
        public List<Guid> PublicationIds { get; set; } = new();
    }

    public class Document
    {
        [Key]
        public Guid Id { get; set; }

        [Required, MaxLength(300)]
        public required string Title { get; set; }

        [Required]
        public required string Content { get; set; } // Could be Yjs doc format (JSON text)

        [Required]
        public required string OwnerId { get; set; } // User ID
    }

    public class DocumentOperation
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid DocumentId { get; set; }

        [Required]
        public required string Operation { get; set; } // JSON for OT/CRDT operation

        [Required]
        public required string AuthorId { get; set; }
    }

    public class CitationSuggestion
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid DocumentId { get; set; }

        [Required]
        public required string Context { get; set; }

        [Required]
        public Guid SuggestedPublicationId { get; set; }

        [Required]
        public required string RelevanceExplanation { get; set; }

        [Required]
        public CitationStatus Status { get; set; }
    }

    public enum CitationStatus
    {
        Pending,
        Accepted,
        Rejected
    }

    public class ResearchGap
    {
        [Key]
        public Guid Id { get; set; }

        [Required, MaxLength(300)]
        public required string Title { get; set; }

        [Required]
        public required string Description { get; set; }

        [Range(0.0, double.MaxValue)]
        public double Priority { get; set; }

        [Required, MaxLength(200)]
        public required string Impact { get; set; }

        [MinLength(1)]
        public List<string> RelevantMissions { get; set; } = new();
    }

    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required, MaxLength(255)]
        public string Username { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginAt { get; set; }

        // Navigation properties
        public List<Chat> Chats { get; set; } = new();
    }

    public class Chat
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required, MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User User { get; set; } = null!;
        public List<Message> Messages { get; set; } = new();
        public List<ChatPublication> ChatPublications { get; set; } = new();
    }

    public class Message
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ChatId { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public MessageRole Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Chat Chat { get; set; } = null!;
    }

    public enum MessageRole
    {
        User,
        Assistant,
        System
    }

    public class ChatPublication
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ChatId { get; set; }

        [Required]
        public Guid PublicationId { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Chat Chat { get; set; } = null!;
        public Publication Publication { get; set; } = null!;
    }
}
