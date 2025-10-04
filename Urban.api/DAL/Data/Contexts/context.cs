using Microsoft.EntityFrameworkCore;
using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Data.Contexts
{
    public class UrbanContext : DbContext
    {
        public UrbanContext(DbContextOptions<UrbanContext> options)
        : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User relationships
            modelBuilder.Entity<User>()
                .HasMany(u => u.Chats)
                .WithOne(c => c.User)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Chat relationships
            modelBuilder.Entity<Chat>()
                .HasMany(c => c.Messages)
                .WithOne(m => m.Chat)
                .HasForeignKey(m => m.ChatId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Chat>()
                .HasMany(c => c.ChatPublications)
                .WithOne(cp => cp.Chat)
                .HasForeignKey(cp => cp.ChatId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure ChatPublication relationships
            modelBuilder.Entity<ChatPublication>()
                .HasOne(cp => cp.Publication)
                .WithMany()
                .HasForeignKey(cp => cp.PublicationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure unique constraints
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // Configure JSON columns for lists
            modelBuilder.Entity<Publication>()
                .Property(p => p.Authors)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
                );

            modelBuilder.Entity<Publication>()
                .Property(p => p.Keywords)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
                );

            modelBuilder.Entity<Publication>()
                .Property(p => p.Organisms)
                .HasConversion(
                    v => v == null ? null : System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => v == null ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null)
                );

            modelBuilder.Entity<Publication>()
                .Property(p => p.ExperimentalConditions)
                .HasConversion(
                    v => v == null ? null : System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => v == null ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null)
                );

            modelBuilder.Entity<Publication>()
                .Property(p => p.BiologicalProcesses)
                .HasConversion(
                    v => v == null ? null : System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => v == null ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null)
                );

            modelBuilder.Entity<Publication>()
                .Property(p => p.SpaceEnvironments)
                .HasConversion(
                    v => v == null ? null : System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => v == null ? null : System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null)
                );

            modelBuilder.Entity<Embedding>()
                .Property(e => e.Vector)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<double>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<double>()
                );

            modelBuilder.Entity<KnowledgeGraphEdge>()
                .Property(kge => kge.PublicationIds)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<Guid>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<Guid>()
                );

            modelBuilder.Entity<ResearchGap>()
                .Property(rg => rg.RelevantMissions)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
                );
        }

        public DbSet<Publication> Publications { get; set; }
        public DbSet<Embedding> Embeddings { get; set; }
        public DbSet<SearchQuery> SearchQueries { get; set; }
        public DbSet<KnowledgeGraphNode> KnowledgeGraphNodes { get; set; }
        public DbSet<KnowledgeGraphEdge> KnowledgeGraphEdges { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<DocumentOperation> DocumentOperations { get; set; }
        public DbSet<CitationSuggestion> CitationSuggestions { get; set; }
        public DbSet<ResearchGap> ResearchGap { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<ChatPublication> ChatPublications { get; set; }

    }

}