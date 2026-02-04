# TaskFlow Backend Migration Guide
## From localStorage to .NET Core + MySQL + JWT Authentication

**Document Version:** 1.1  
**Last Updated:** February 4, 2026  
**Target Framework:** .NET 8.0 / .NET 7.0

### 📝 Changelog
**v1.1 (Feb 4, 2026):**
- Added comprehensive Error Handling & Validation section
- Added Performance Optimization strategies (caching, indexing, pagination)
- Added Security Best Practices (rate limiting, encryption, HTTPS headers)
- Added Logging & Monitoring with Serilog and Health Checks
- Added Testing Strategy with unit and integration test examples
- Enhanced with real-world production scenarios

**v1.0 (Feb 4, 2026):**
- Initial release with complete migration guide
- Database schema design
- Backend architecture
- Authentication & Authorization
- API endpoints documentation

---

## Table of Contents
1. [Database Design](#1-database-design)
2. [Backend Architecture](#2-backend-architecture)
3. [Entity Framework Core Setup](#3-entity-framework-core-setup)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [API Endpoints Documentation](#5-api-endpoints-documentation)
6. [Implementation Steps](#6-implementation-steps)
7. [Testing & Deployment](#7-testing--deployment)
8. [Error Handling & Validation](#8-error-handling--validation)
9. [Performance Optimization](#9-performance-optimization)
10. [Security Best Practices](#10-security-best-practices)
11. [Logging & Monitoring](#11-logging--monitoring)
12. [Testing Strategy](#12-testing-strategy)
13. [Next Steps](#13-next-steps)

---

## 1. Database Design

### 1.1 Complete MySQL Schema

```sql
-- ============================================
-- TaskFlow Database Schema for MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS taskflow_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE taskflow_db;

-- ============================================
-- Table: Users
-- ============================================
CREATE TABLE Users (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('CUSTOMER', 'WORKER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    Avatar VARCHAR(500),
    Phone VARCHAR(20),
    IsBusy BOOLEAN DEFAULT FALSE,
    Rating DECIMAL(3,2) DEFAULT 0.00,
    CompletedJobs INT DEFAULT 0,
    Experience INT DEFAULT 0,
    Status ENUM('ACTIVE', 'SUSPENDED', 'UNVERIFIED') NOT NULL DEFAULT 'UNVERIFIED',
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (Email),
    INDEX idx_role (Role),
    INDEX idx_status (Status)
) ENGINE=InnoDB;

-- ============================================
-- Table: Addresses
-- ============================================
CREATE TABLE Addresses (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    UserId CHAR(36) NOT NULL,
    State VARCHAR(100) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Area VARCHAR(100),
    FullAddress TEXT NOT NULL,
    Latitude DECIMAL(10, 8),
    Longitude DECIMAL(11, 8),
    IsDefault BOOLEAN DEFAULT TRUE,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_user (UserId),
    INDEX idx_location (City, State)
) ENGINE=InnoDB;

-- ============================================
-- Table: WorkerSkills
-- ============================================
CREATE TABLE WorkerSkills (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    WorkerId CHAR(36) NOT NULL,
    Skill VARCHAR(100) NOT NULL,
    FOREIGN KEY (WorkerId) REFERENCES Users(Id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_skill (WorkerId, Skill),
    INDEX idx_worker (WorkerId)
) ENGINE=InnoDB;

-- ============================================
-- Table: WorkerCategories
-- ============================================
CREATE TABLE WorkerCategories (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    WorkerId CHAR(36) NOT NULL,
    CategoryId VARCHAR(50) NOT NULL,
    FOREIGN KEY (WorkerId) REFERENCES Users(Id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_category (WorkerId, CategoryId),
    INDEX idx_worker (WorkerId),
    INDEX idx_category (CategoryId)
) ENGINE=InnoDB;

-- ============================================
-- Table: Tasks
-- ============================================
CREATE TABLE Tasks (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    Title VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    Category VARCHAR(50) NOT NULL,
    CustomerId CHAR(36) NOT NULL,
    WorkerId CHAR(36),
    WorkerName VARCHAR(100),
    Status ENUM(
        'POSTED', 'BIDDING', 'ASSIGNED', 'CONFIRMED', 
        'TRAVELING', 'ARRIVED', 'IN_PROGRESS', 
        'WORK_COMPLETED', 'VERIFIED', 'PAID', 
        'COMPLETED', 'CANCELLED', 'DISPUTED'
    ) NOT NULL DEFAULT 'POSTED',
    BudgetMin DECIMAL(10,2) NOT NULL,
    BudgetMax DECIMAL(10,2) NOT NULL,
    PreferredDate DATE NOT NULL,
    CheckInTime DATETIME,
    AdminReviewNotes TEXT,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CompletionDate DATETIME,
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (WorkerId) REFERENCES Users(Id) ON DELETE SET NULL,
    INDEX idx_customer (CustomerId),
    INDEX idx_worker (WorkerId),
    INDEX idx_status (Status),
    INDEX idx_category (Category),
    INDEX idx_date (PreferredDate)
) ENGINE=InnoDB;

-- ============================================
-- Table: TaskLocations
-- ============================================
CREATE TABLE TaskLocations (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    TaskId CHAR(36) NOT NULL,
    State VARCHAR(100) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Area VARCHAR(100),
    FullAddress TEXT NOT NULL,
    Latitude DECIMAL(10, 8),
    Longitude DECIMAL(11, 8),
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    INDEX idx_task (TaskId),
    INDEX idx_location (City, State)
) ENGINE=InnoDB;

-- ============================================
-- Table: TaskPhotos
-- ============================================
CREATE TABLE TaskPhotos (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    TaskId CHAR(36) NOT NULL,
    PhotoUrl VARCHAR(500) NOT NULL,
    UploadedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    INDEX idx_task (TaskId)
) ENGINE=InnoDB;

-- ============================================
-- Table: Bids
-- ============================================
CREATE TABLE Bids (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    TaskId CHAR(36) NOT NULL,
    WorkerId CHAR(36) NOT NULL,
    WorkerName VARCHAR(100) NOT NULL,
    WorkerAvatar VARCHAR(500),
    WorkerRating DECIMAL(3,2) DEFAULT 0.00,
    Amount DECIMAL(10,2) NOT NULL,
    EstimatedDays INT NOT NULL,
    Message TEXT,
    Status ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (WorkerId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_task (TaskId),
    INDEX idx_worker (WorkerId),
    INDEX idx_status (Status)
) ENGINE=InnoDB;

-- ============================================
-- Table: ProgressUpdates
-- ============================================
CREATE TABLE ProgressUpdates (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    TaskId CHAR(36) NOT NULL,
    Status ENUM(
        'POSTED', 'BIDDING', 'ASSIGNED', 'CONFIRMED', 
        'TRAVELING', 'ARRIVED', 'IN_PROGRESS', 
        'WORK_COMPLETED', 'VERIFIED', 'PAID', 
        'COMPLETED', 'CANCELLED', 'DISPUTED'
    ) NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    INDEX idx_task (TaskId),
    INDEX idx_timestamp (Timestamp)
) ENGINE=InnoDB;

-- ============================================
-- Table: Reviews
-- ============================================
CREATE TABLE Reviews (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    TaskId CHAR(36) NOT NULL,
    ReviewerId CHAR(36) NOT NULL,
    ReviewerName VARCHAR(100) NOT NULL,
    RevieweeId CHAR(36) NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT NOT NULL,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (ReviewerId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (RevieweeId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_task (TaskId),
    INDEX idx_reviewer (ReviewerId),
    INDEX idx_reviewee (RevieweeId)
) ENGINE=InnoDB;

-- ============================================
-- Table: Disputes
-- ============================================
CREATE TABLE Disputes (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    TaskId CHAR(36) NOT NULL,
    InitiatorId CHAR(36) NOT NULL,
    InitiatorRole ENUM('CUSTOMER', 'WORKER', 'ADMIN') NOT NULL,
    RespondentId CHAR(36) NOT NULL,
    Reason TEXT NOT NULL,
    IssueType VARCHAR(100),
    Status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    AdminNotes TEXT,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ResolvedDate DATETIME,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (InitiatorId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (RespondentId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_task (TaskId),
    INDEX idx_status (Status)
) ENGINE=InnoDB;

-- ============================================
-- Table: DisputeEvidence
-- ============================================
CREATE TABLE DisputeEvidence (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    DisputeId CHAR(36) NOT NULL,
    EvidenceUrl VARCHAR(500) NOT NULL,
    UploadedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DisputeId) REFERENCES Disputes(Id) ON DELETE CASCADE,
    INDEX idx_dispute (DisputeId)
) ENGINE=InnoDB;

-- ============================================
-- Table: ChatMessages
-- ============================================
CREATE TABLE ChatMessages (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    DisputeId CHAR(36) NOT NULL,
    SenderId CHAR(36) NOT NULL,
    SenderName VARCHAR(100) NOT NULL,
    Message TEXT NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DisputeId) REFERENCES Disputes(Id) ON DELETE CASCADE,
    FOREIGN KEY (SenderId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_dispute (DisputeId),
    INDEX idx_timestamp (Timestamp)
) ENGINE=InnoDB;

-- ============================================
-- Table: PlatformActivity (Audit Log)
-- ============================================
CREATE TABLE PlatformActivity (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    UserId CHAR(36),
    ActivityType VARCHAR(50) NOT NULL,
    Message TEXT NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    Icon VARCHAR(50),
    Color VARCHAR(50),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL,
    INDEX idx_user (UserId),
    INDEX idx_timestamp (Timestamp),
    INDEX idx_type (ActivityType)
) ENGINE=InnoDB;

-- ============================================
-- Table: RefreshTokens (For JWT)
-- ============================================
CREATE TABLE RefreshTokens (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    UserId CHAR(36) NOT NULL,
    Token VARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt DATETIME NOT NULL,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    RevokedDate DATETIME,
    IsRevoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_user (UserId),
    INDEX idx_token (Token),
    INDEX idx_expires (ExpiresAt)
) ENGINE=InnoDB;
```

### 1.2 Database Relationships Diagram

```
Users (1) ─────< (∞) Addresses
  │
  ├─< WorkerSkills (∞)
  ├─< WorkerCategories (∞)
  │
  ├─< Tasks (∞) as Customer
  ├─< Tasks (∞) as Worker
  │     │
  │     ├─< TaskLocations (1)
  │     ├─< TaskPhotos (∞)
  │     ├─< Bids (∞)
  │     ├─< ProgressUpdates (∞)
  │     ├─< Reviews (∞)
  │     └─< Disputes (∞)
  │           │
  │           ├─< DisputeEvidence (∞)
  │           └─< ChatMessages (∞)
  │
  ├─< Reviews (∞) as Reviewer
  ├─< Reviews (∞) as Reviewee
  ├─< Disputes (∞) as Initiator
  ├─< Disputes (∞) as Respondent
  ├─< ChatMessages (∞)
  ├─< PlatformActivity (∞)
  └─< RefreshTokens (∞)
```

---

## 2. Backend Architecture

### 2.1 Project Structure

```
TaskFlowAPI/
├── TaskFlowAPI.sln
├── TaskFlowAPI/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── UsersController.cs
│   │   ├── TasksController.cs
│   │   ├── BidsController.cs
│   │   ├── ReviewsController.cs
│   │   ├── DisputesController.cs
│   │   └── AdminController.cs
│   ├── Models/
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Address.cs
│   │   │   ├── Task.cs
│   │   │   ├── TaskLocation.cs
│   │   │   ├── Bid.cs
│   │   │   ├── Review.cs
│   │   │   ├── Dispute.cs
│   │   │   ├── ChatMessage.cs
│   │   │   ├── ProgressUpdate.cs
│   │   │   └── RefreshToken.cs
│   │   └── Enums/
│   │       ├── UserRole.cs
│   │       ├── UserStatus.cs
│   │       ├── TaskStatus.cs
│   │       └── DisputeStatus.cs
│   ├── DTOs/
│   │   ├── Auth/
│   │   │   ├── LoginRequestDto.cs
│   │   │   ├── RegisterRequestDto.cs
│   │   │   ├── AuthResponseDto.cs
│   │   │   └── RefreshTokenRequestDto.cs
│   │   ├── User/
│   │   │   ├── UserDto.cs
│   │   │   ├── CreateUserDto.cs
│   │   │   └── UpdateUserDto.cs
│   │   ├── Task/
│   │   │   ├── TaskDto.cs
│   │   │   ├── CreateTaskDto.cs
│   │   │   ├── UpdateTaskDto.cs
│   │   │   └── TaskDetailsDto.cs
│   │   ├── Bid/
│   │   │   ├── BidDto.cs
│   │   │   └── CreateBidDto.cs
│   │   └── Common/
│   │       ├── AddressDto.cs
│   │       └── ApiResponse.cs
│   ├── Data/
│   │   ├── ApplicationDbContext.cs
│   │   └── Configurations/
│   │       ├── UserConfiguration.cs
│   │       ├── TaskConfiguration.cs
│   │       └── ... (other entity configurations)
│   ├── Repositories/
│   │   ├── Interfaces/
│   │   │   ├── IUserRepository.cs
│   │   │   ├── ITaskRepository.cs
│   │   │   ├── IBidRepository.cs
│   │   │   └── IGenericRepository.cs
│   │   └── Implementations/
│   │       ├── UserRepository.cs
│   │       ├── TaskRepository.cs
│   │       ├── BidRepository.cs
│   │       └── GenericRepository.cs
│   ├── Services/
│   │   ├── Interfaces/
│   │   │   ├── IAuthService.cs
│   │   │   ├── IUserService.cs
│   │   │   ├── ITaskService.cs
│   │   │   ├── IBidService.cs
│   │   │   └── ITokenService.cs
│   │   └── Implementations/
│   │       ├── AuthService.cs
│   │       ├── UserService.cs
│   │       ├── TaskService.cs
│   │       ├── BidService.cs
│   │       └── TokenService.cs
│   ├── Middleware/
│   │   ├── ExceptionHandlingMiddleware.cs
│   │   └── JwtMiddleware.cs
│   ├── Helpers/
│   │   ├── AutoMapperProfile.cs
│   │   ├── JwtSettings.cs
│   │   └── PasswordHelper.cs
│   ├── Migrations/
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── Program.cs
│   └── TaskFlowAPI.csproj
└── TaskFlowAPI.Tests/
    └── ... (unit and integration tests)
```

---

## 3. Entity Framework Core Setup

### 3.1 Install Required NuGet Packages

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Pomelo.EntityFrameworkCore.MySql
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package BCrypt.Net-Next
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
```

### 3.2 Entity Models

**Models/Entities/User.cs**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlowAPI.Models.Entities
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; } = UserRole.CUSTOMER;

        [MaxLength(500)]
        public string? Avatar { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        public bool IsBusy { get; set; } = false;

        [Column(TypeName = "decimal(3,2)")]
        public decimal Rating { get; set; } = 0;

        public int CompletedJobs { get; set; } = 0;

        public int? Experience { get; set; }

        [Required]
        public UserStatus Status { get; set; } = UserStatus.UNVERIFIED;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();
        public virtual ICollection<WorkerSkill> Skills { get; set; } = new List<WorkerSkill>();
        public virtual ICollection<WorkerCategory> Categories { get; set; } = new List<WorkerCategory>();
        public virtual ICollection<Task> TasksAsCustomer { get; set; } = new List<Task>();
        public virtual ICollection<Task> TasksAsWorker { get; set; } = new List<Task>();
        public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();
        public virtual ICollection<Review> ReviewsGiven { get; set; } = new List<Review>();
        public virtual ICollection<Review> ReviewsReceived { get; set; } = new List<Review>();
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
```

**Models/Entities/Task.cs**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlowAPI.Models.Entities
{
    public class Task
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [ForeignKey(nameof(Customer))]
        public Guid CustomerId { get; set; }

        [ForeignKey(nameof(Worker))]
        public Guid? WorkerId { get; set; }

        [MaxLength(100)]
        public string? WorkerName { get; set; }

        [Required]
        public TaskStatus Status { get; set; } = TaskStatus.POSTED;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal BudgetMin { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal BudgetMax { get; set; }

        [Required]
        public DateTime PreferredDate { get; set; }

        public DateTime? CheckInTime { get; set; }

        public string? AdminReviewNotes { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? CompletionDate { get; set; }

        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual User Customer { get; set; } = null!;
        public virtual User? Worker { get; set; }
        public virtual TaskLocation Location { get; set; } = null!;
        public virtual ICollection<TaskPhoto> Photos { get; set; } = new List<TaskPhoto>();
        public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();
        public virtual ICollection<ProgressUpdate> ProgressUpdates { get; set; } = new List<ProgressUpdate>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();
    }
}
```

**Models/Entities/Bid.cs**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlowAPI.Models.Entities
{
    public class Bid
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        [ForeignKey(nameof(Task))]
        public Guid TaskId { get; set; }

        [Required]
        [ForeignKey(nameof(Worker))]
        public Guid WorkerId { get; set; }

        [Required]
        [MaxLength(100)]
        public string WorkerName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? WorkerAvatar { get; set; }

        [Column(TypeName = "decimal(3,2)")]
        public decimal WorkerRating { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        [Required]
        public int EstimatedDays { get; set; }

        public string? Message { get; set; }

        [Required]
        public BidStatus Status { get; set; } = BidStatus.PENDING;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual Task Task { get; set; } = null!;
        public virtual User Worker { get; set; } = null!;
    }

    public enum BidStatus
    {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}
```

### 3.3 DbContext Configuration

**Data/ApplicationDbContext.cs**
```csharp
using Microsoft.EntityFrameworkCore;
using TaskFlowAPI.Models.Entities;

namespace TaskFlowAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
            : base(options)
        {
        }

        // DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<WorkerSkill> WorkerSkills { get; set; }
        public DbSet<WorkerCategory> WorkerCategories { get; set; }
        public DbSet<Task> Tasks { get; set; }
        public DbSet<TaskLocation> TaskLocations { get; set; }
        public DbSet<TaskPhoto> TaskPhotos { get; set; }
        public DbSet<Bid> Bids { get; set; }
        public DbSet<ProgressUpdate> ProgressUpdates { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Dispute> Disputes { get; set; }
        public DbSet<DisputeEvidence> DisputeEvidence { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<PlatformActivity> PlatformActivity { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply configurations
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Role);
                entity.HasIndex(e => e.Status);

                entity.Property(e => e.Role)
                    .HasConversion<string>();
                
                entity.Property(e => e.Status)
                    .HasConversion<string>();

                // One-to-Many: User -> Addresses
                entity.HasMany(e => e.Addresses)
                    .WithOne()
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One-to-Many: User (Customer) -> Tasks
                entity.HasMany(e => e.TasksAsCustomer)
                    .WithOne(t => t.Customer)
                    .HasForeignKey(t => t.CustomerId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One-to-Many: User (Worker) -> Tasks
                entity.HasMany(e => e.TasksAsWorker)
                    .WithOne(t => t.Worker)
                    .HasForeignKey(t => t.WorkerId)
                    .OnDelete(DeleteBehavior.SetNull);

                // One-to-Many: User -> Reviews (as Reviewer)
                entity.HasMany(e => e.ReviewsGiven)
                    .WithOne()
                    .HasForeignKey(r => r.ReviewerId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One-to-Many: User -> Reviews (as Reviewee)
                entity.HasMany(e => e.ReviewsReceived)
                    .WithOne()
                    .HasForeignKey(r => r.RevieweeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Task Configuration
            modelBuilder.Entity<Task>(entity =>
            {
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.PreferredDate);

                entity.Property(e => e.Status)
                    .HasConversion<string>();

                // One-to-One: Task -> TaskLocation
                entity.HasOne(e => e.Location)
                    .WithOne()
                    .HasForeignKey<TaskLocation>(l => l.TaskId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One-to-Many: Task -> Photos
                entity.HasMany(e => e.Photos)
                    .WithOne()
                    .HasForeignKey(p => p.TaskId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One-to-Many: Task -> Bids
                entity.HasMany(e => e.Bids)
                    .WithOne(b => b.Task)
                    .HasForeignKey(b => b.TaskId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One-to-Many: Task -> ProgressUpdates
                entity.HasMany(e => e.ProgressUpdates)
                    .WithOne()
                    .HasForeignKey(p => p.TaskId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Bid Configuration
            modelBuilder.Entity<Bid>(entity =>
            {
                entity.HasIndex(e => new { e.TaskId, e.WorkerId });
                entity.HasIndex(e => e.Status);

                entity.Property(e => e.Status)
                    .HasConversion<string>();
            });

            // Dispute Configuration
            modelBuilder.Entity<Dispute>(entity =>
            {
                entity.HasIndex(e => e.TaskId);
                entity.HasIndex(e => e.Status);

                entity.Property(e => e.Status)
                    .HasConversion<string>();
                
                entity.Property(e => e.InitiatorRole)
                    .HasConversion<string>();

                // One-to-Many: Dispute -> ChatMessages
                entity.HasMany(e => e.Messages)
                    .WithOne()
                    .HasForeignKey(m => m.DisputeId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One-to-Many: Dispute -> Evidence
                entity.HasMany(e => e.Evidence)
                    .WithOne()
                    .HasForeignKey(ev => ev.DisputeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
```

### 3.4 Connection String Configuration

**appsettings.json**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=taskflow_db;User=root;Password=yourpassword;"
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "TaskFlowAPI",
    "Audience": "TaskFlowClient",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

**Program.cs (Partial - DbContext Registration)**
```csharp
using Microsoft.EntityFrameworkCore;
using TaskFlowAPI.Data;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseMySql(connectionString, 
        ServerVersion.AutoDetect(connectionString),
        mySqlOptions =>
        {
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
});

// ... rest of configuration
```

---

## 4. Authentication & Authorization

### 4.1 JWT Token Service

**Helpers/JwtSettings.cs**
```csharp
namespace TaskFlowAPI.Helpers
{
    public class JwtSettings
    {
        public string SecretKey { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int AccessTokenExpirationMinutes { get; set; }
        public int RefreshTokenExpirationDays { get; set; }
    }
}
```

**Services/Interfaces/ITokenService.cs**
```csharp
using TaskFlowAPI.Models.Entities;

namespace TaskFlowAPI.Services.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        Task<RefreshToken> SaveRefreshTokenAsync(Guid userId, string token);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task RevokeRefreshTokenAsync(string token);
        Task RevokeAllUserTokensAsync(Guid userId);
    }
}
```

**Services/Implementations/TokenService.cs**
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TaskFlowAPI.Data;
using TaskFlowAPI.Helpers;
using TaskFlowAPI.Models.Entities;
using TaskFlowAPI.Services.Interfaces;

namespace TaskFlowAPI.Services.Implementations
{
    public class TokenService : ITokenService
    {
        private readonly JwtSettings _jwtSettings;
        private readonly ApplicationDbContext _context;

        public TokenService(IOptions<JwtSettings> jwtSettings, ApplicationDbContext context)
        {
            _jwtSettings = jwtSettings.Value;
            _context = context;
        }

        public string GenerateAccessToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("status", user.Status.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public async Task<RefreshToken> SaveRefreshTokenAsync(Guid userId, string token)
        {
            var refreshToken = new RefreshToken
            {
                UserId = userId,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
                CreatedDate = DateTime.UtcNow
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
            return refreshToken;
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsRevoked);
        }

        public async Task RevokeRefreshTokenAsync(string token)
        {
            var refreshToken = await GetRefreshTokenAsync(token);
            if (refreshToken != null)
            {
                refreshToken.IsRevoked = true;
                refreshToken.RevokedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task RevokeAllUserTokensAsync(Guid userId)
        {
            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.RevokedDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }
    }
}
```

### 4.2 Authentication Service

**Services/Interfaces/IAuthService.cs**
```csharp
using TaskFlowAPI.DTOs.Auth;

namespace TaskFlowAPI.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request);
        Task LogoutAsync(string refreshToken);
    }
}
```

**Services/Implementations/AuthService.cs**
```csharp
using TaskFlowAPI.Data;
using TaskFlowAPI.DTOs.Auth;
using TaskFlowAPI.Models.Entities;
using TaskFlowAPI.Services.Interfaces;
using BCrypt.Net;

namespace TaskFlowAPI.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthService(ApplicationDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new Exception("Email already registered");
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create user
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = request.Role,
                Phone = request.Phone,
                Avatar = $"https://picsum.photos/seed/{request.Email}/200",
                Status = UserStatus.ACTIVE,
                CreatedDate = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate tokens
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            await _tokenService.SaveRefreshTokenAsync(user.Id, refreshToken);

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    Avatar = user.Avatar,
                    Status = user.Status.ToString()
                }
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            // Find user
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                throw new Exception("Invalid email or password");
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new Exception("Invalid email or password");
            }

            // Check if user is suspended
            if (user.Status == UserStatus.SUSPENDED)
            {
                throw new Exception("Account is suspended");
            }

            // Generate tokens
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            await _tokenService.SaveRefreshTokenAsync(user.Id, refreshToken);

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    Avatar = user.Avatar,
                    Status = user.Status.ToString(),
                    Rating = user.Rating,
                    CompletedJobs = user.CompletedJobs
                }
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            var storedToken = await _tokenService.GetRefreshTokenAsync(request.RefreshToken);

            if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow)
            {
                throw new Exception("Invalid or expired refresh token");
            }

            var user = await _context.Users.FindAsync(storedToken.UserId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            // Revoke old token
            await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken);

            // Generate new tokens
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            await _tokenService.SaveRefreshTokenAsync(user.Id, refreshToken);

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    Avatar = user.Avatar,
                    Status = user.Status.ToString()
                }
            };
        }

        public async Task LogoutAsync(string refreshToken)
        {
            await _tokenService.RevokeRefreshTokenAsync(refreshToken);
        }
    }
}
```

### 4.3 JWT Authentication Configuration

**Program.cs (Authentication Setup)**
```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TaskFlowAPI.Helpers;

// ... builder setup

// Configure JWT Settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

// Add Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in production
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CustomerOnly", policy => policy.RequireRole("CUSTOMER"));
    options.AddPolicy("WorkerOnly", policy => policy.RequireRole("WORKER"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("ADMIN"));
    options.AddPolicy("WorkerOrAdmin", policy => policy.RequireRole("WORKER", "ADMIN"));
});

// ... app configuration

app.UseAuthentication();
app.UseAuthorization();
```

### 4.4 Authentication Controller

**Controllers/AuthController.cs**
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlowAPI.DTOs.Auth;
using TaskFlowAPI.Services.Interfaces;

namespace TaskFlowAPI.Controllers
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
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            try
            {
                var response = await _authService.RegisterAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                var response = await _authService.RefreshTokenAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                await _authService.LogoutAsync(request.RefreshToken);
                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            return Ok(new
            {
                id = userId,
                email,
                name,
                role
            });
        }
    }
}
```

---

## 5. API Endpoints Documentation

### 5.1 Authentication Endpoints

#### POST /api/auth/register
**Description:** Register a new user  
**Authentication:** No  
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "CUSTOMER",
  "phone": "+91-9876543210"
}
```
**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "base64encodedtoken...",
  "user": {
    "id": "guid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "avatar": "https://picsum.photos/seed/john@example.com/200",
    "status": "ACTIVE"
  }
}
```

#### POST /api/auth/login
**Description:** Login with email and password  
**Authentication:** No  
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
**Response (200 OK):** Same as register

#### POST /api/auth/refresh-token
**Description:** Get new access token using refresh token  
**Authentication:** No  
**Request Body:**
```json
{
  "refreshToken": "base64encodedtoken..."
}
```
**Response (200 OK):** Same as register

#### POST /api/auth/logout
**Description:** Logout and revoke refresh token  
**Authentication:** Yes  
**Request Body:**
```json
{
  "refreshToken": "base64encodedtoken..."
}
```
**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me
**Description:** Get current authenticated user info  
**Authentication:** Yes  
**Response (200 OK):**
```json
{
  "id": "guid-here",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "CUSTOMER"
}
```

---

### 5.2 Task Endpoints

#### GET /api/tasks
**Description:** Get all tasks with optional filters  
**Authentication:** Yes  
**Query Parameters:**
- `status` (optional): Filter by task status
- `category` (optional): Filter by category
- `customerId` (optional): Filter by customer ID
- `workerId` (optional): Filter by worker ID
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "guid",
      "title": "Fix Leaky Pipe",
      "description": "Kitchen sink is leaking",
      "category": "plumber",
      "status": "BIDDING",
      "budgetMin": 500,
      "budgetMax": 2000,
      "preferredDate": "2026-02-10",
      "customerId": "guid",
      "location": {
        "state": "Delhi",
        "city": "South Delhi",
        "area": "Powai",
        "fullAddress": "123 Main St"
      },
      "bidsCount": 3,
      "createdDate": "2026-02-03T10:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 20
}
```

#### GET /api/tasks/{id}
**Description:** Get task details by ID  
**Authentication:** Yes  
**Response (200 OK):**
```json
{
  "id": "guid",
  "title": "Fix Leaky Pipe",
  "description": "Kitchen sink is leaking",
  "category": "plumber",
  "status": "BIDDING",
  "budgetMin": 500,
  "budgetMax": 2000,
  "preferredDate": "2026-02-10",
  "customerId": "guid",
  "workerId": null,
  "location": {
    "state": "Delhi",
    "city": "South Delhi",
    "area": "Powai",
    "fullAddress": "123 Main St",
    "latitude": 28.5355,
    "longitude": 77.3910
  },
  "photos": ["url1", "url2"],
  "bids": [...],
  "progressUpdates": [...],
  "reviews": [],
  "createdDate": "2026-02-03T10:00:00Z"
}
```

#### POST /api/tasks
**Description:** Create a new task  
**Authentication:** Yes (Customer only)  
**Request Body:**
```json
{
  "title": "Fix Leaky Pipe",
  "description": "Kitchen sink is leaking",
  "category": "plumber",
  "budgetMin": 500,
  "budgetMax": 2000,
  "preferredDate": "2026-02-10",
  "location": {
    "state": "Delhi",
    "city": "South Delhi",
    "area": "Powai",
    "fullAddress": "123 Main St, Powai, South Delhi",
    "latitude": 28.5355,
    "longitude": 77.3910
  },
  "photos": ["url1", "url2"]
}
```
**Response (201 Created):** Returns created task

#### PUT /api/tasks/{id}/status
**Description:** Update task status  
**Authentication:** Yes  
**Authorization:** Customer (own tasks), Worker (assigned tasks), Admin  
**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```
**Response (200 OK):** Returns updated task

#### DELETE /api/tasks/{id}
**Description:** Delete/Cancel a task  
**Authentication:** Yes  
**Authorization:** Customer (own tasks), Admin  
**Response (204 No Content)**

---

### 5.3 Bid Endpoints

#### GET /api/bids/task/{taskId}
**Description:** Get all bids for a task  
**Authentication:** Yes  
**Authorization:** Customer (own tasks), Worker (own bids), Admin  
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "guid",
      "taskId": "guid",
      "workerId": "guid",
      "workerName": "Mike Plumber",
      "workerAvatar": "url",
      "workerRating": 4.9,
      "amount": 1500,
      "estimatedDays": 1,
      "message": "I can fix this today",
      "status": "PENDING",
      "createdDate": "2026-02-03T11:00:00Z"
    }
  ]
}
```

#### POST /api/bids
**Description:** Submit a bid on a task  
**Authentication:** Yes (Worker only)  
**Request Body:**
```json
{
  "taskId": "guid",
  "amount": 1500,
  "estimatedDays": 1,
  "message": "I can fix this today"
}
```
**Response (201 Created):** Returns created bid

#### PUT /api/bids/{id}/accept
**Description:** Accept a bid  
**Authentication:** Yes (Customer only)  
**Response (200 OK):** Returns updated bid and task

#### PUT /api/bids/{id}/reject
**Description:** Reject a bid  
**Authentication:** Yes (Customer only)  
**Response (200 OK):** Returns updated bid

---

### 5.4 Review Endpoints

#### GET /api/reviews
**Description:** Get all reviews (with filters)  
**Authentication:** Optional  
**Query Parameters:**
- `workerId` (optional): Filter by worker
- `taskId` (optional): Filter by task
- `rating` (optional): Filter by rating
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "guid",
      "taskId": "guid",
      "reviewerId": "guid",
      "reviewerName": "John Doe",
      "revieweeId": "guid",
      "rating": 5,
      "comment": "Excellent work!",
      "createdDate": "2026-02-03T15:00:00Z"
    }
  ],
  "averageRating": 4.8,
  "totalReviews": 25
}
```

#### POST /api/reviews
**Description:** Submit a review  
**Authentication:** Yes (Customer only)  
**Request Body:**
```json
{
  "taskId": "guid",
  "revieweeId": "guid",
  "rating": 5,
  "comment": "Excellent work!"
}
```
**Response (201 Created):** Returns created review

#### DELETE /api/reviews/{id}
**Description:** Delete a review  
**Authentication:** Yes  
**Authorization:** Review author, Admin  
**Response (204 No Content)**

---

### 5.5 Dispute Endpoints

#### GET /api/disputes
**Description:** Get all disputes  
**Authentication:** Yes  
**Authorization:** Admin (all), Customer/Worker (own disputes)  
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "guid",
      "taskId": "guid",
      "initiatorId": "guid",
      "initiatorRole": "CUSTOMER",
      "respondentId": "guid",
      "reason": "Work not completed properly",
      "issueType": "quality",
      "status": "PENDING",
      "messagesCount": 3,
      "createdDate": "2026-02-03T16:00:00Z"
    }
  ]
}
```

#### POST /api/disputes
**Description:** Create a dispute  
**Authentication:** Yes (Customer or Worker)  
**Request Body:**
```json
{
  "taskId": "guid",
  "respondentId": "guid",
  "reason": "Work not completed properly",
  "issueType": "quality",
  "evidence": ["url1", "url2"]
}
```
**Response (201 Created):** Returns created dispute

#### POST /api/disputes/{id}/messages
**Description:** Add message to dispute  
**Authentication:** Yes  
**Request Body:**
```json
{
  "message": "I can provide additional evidence"
}
```
**Response (201 Created):** Returns created message

#### PUT /api/disputes/{id}/resolve
**Description:** Resolve a dispute  
**Authentication:** Yes (Admin only)  
**Request Body:**
```json
{
  "adminNotes": "Resolved in favor of customer"
}
```
**Response (200 OK):** Returns updated dispute

---

### 5.6 User Endpoints

#### GET /api/users
**Description:** Get all users (Admin only)  
**Authentication:** Yes (Admin)  
**Query Parameters:**
- `role` (optional): Filter by role
- `status` (optional): Filter by status
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "guid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "rating": 4.8,
      "completedJobs": 12,
      "createdDate": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 100
}
```

#### GET /api/users/{id}
**Description:** Get user by ID  
**Authentication:** Yes  
**Response (200 OK):** Returns user details

#### PUT /api/users/{id}
**Description:** Update user profile  
**Authentication:** Yes (Own profile or Admin)  
**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+91-9876543210",
  "avatar": "new-url"
}
```
**Response (200 OK):** Returns updated user

#### PUT /api/users/{id}/suspend
**Description:** Suspend a user  
**Authentication:** Yes (Admin only)  
**Response (200 OK):** Returns updated user

#### PUT /api/users/{id}/activate
**Description:** Activate a user  
**Authentication:** Yes (Admin only)  
**Response (200 OK):** Returns updated user

---

### 5.7 Admin Endpoints

#### GET /api/admin/dashboard
**Description:** Get admin dashboard statistics  
**Authentication:** Yes (Admin only)  
**Response (200 OK):**
```json
{
  "totalUsers": 500,
  "totalTasks": 1200,
  "totalDisputes": 15,
  "activeWorkers": 150,
  "pendingApprovals": 8,
  "revenueThisMonth": 125000,
  "tasksCompletedThisMonth": 234
}
```

#### GET /api/admin/tasks/pending
**Description:** Get tasks pending admin review  
**Authentication:** Yes (Admin only)  
**Response (200 OK):** Returns list of tasks

#### PUT /api/admin/tasks/{id}/approve
**Description:** Approve a task for bidding  
**Authentication:** Yes (Admin only)  
**Request Body:**
```json
{
  "notes": "Approved for bidding"
}
```
**Response (200 OK):** Returns updated task

#### PUT /api/admin/tasks/{id}/reject
**Description:** Reject a task  
**Authentication:** Yes (Admin only)  
**Request Body:**
```json
{
  "reason": "Inappropriate content"
}
```
**Response (200 OK):** Returns updated task

---

## 6. Implementation Steps

### Step 1: Project Setup
```bash
# Create new Web API project
dotnet new webapi -n TaskFlowAPI
cd TaskFlowAPI

# Install required packages
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Pomelo.EntityFrameworkCore.MySql
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package BCrypt.Net-Next
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
```

### Step 2: Database Setup
```bash
# Install MySQL (if not already installed)
# For macOS:
brew install mysql
brew services start mysql

# Create database
mysql -u root -p
CREATE DATABASE taskflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### Step 3: Create Entity Models
- Create all entity classes in `Models/Entities/`
- Create enums in `Models/Enums/`
- Follow the structure provided in section 3.2

### Step 4: Configure DbContext
- Create `ApplicationDbContext` as shown in section 3.3
- Configure relationships and constraints

### Step 5: Create and Run Migrations
```bash
# Create initial migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

### Step 6: Implement Repository Pattern
- Create repository interfaces in `Repositories/Interfaces/`
- Implement repositories in `Repositories/Implementations/`
- Register repositories in `Program.cs`:
```csharp
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<IBidRepository, BidRepository>();
// ... register all repositories
```

### Step 7: Implement Services
- Create service interfaces in `Services/Interfaces/`
- Implement services in `Services/Implementations/`
- Register services in `Program.cs`:
```csharp
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITaskService, TaskService>();
// ... register all services
```

### Step 8: Configure Authentication
- Set up JWT authentication as shown in section 4.3
- Configure authorization policies
- Add authentication middleware

### Step 9: Create Controllers
- Implement all controllers as shown in section 5
- Add proper authorization attributes
- Implement error handling

### Step 10: Configure CORS
```csharp
// Add in Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:4200")
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials();
        });
});

// Use in middleware
app.UseCors("AllowAngularApp");
```

### Step 11: Add AutoMapper
```csharp
// Create mapping profile
public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        CreateMap<User, UserDto>();
        CreateMap<CreateUserDto, User>();
        CreateMap<Task, TaskDto>();
        CreateMap<CreateTaskDto, Task>();
        // ... add all mappings
    }
}

// Register in Program.cs
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));
```

### Step 12: Add Exception Handling Middleware
```csharp
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = exception switch
        {
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            ArgumentException => StatusCodes.Status400BadRequest,
            KeyNotFoundException => StatusCodes.Status404NotFound,
            _ => StatusCodes.Status500InternalServerError
        };

        return context.Response.WriteAsJsonAsync(new
        {
            error = exception.Message,
            statusCode = context.Response.StatusCode
        });
    }
}

// Register in Program.cs
app.UseMiddleware<ExceptionHandlingMiddleware>();
```

---

## 7. Testing & Deployment

### 7.1 Testing with Postman

1. Import this Postman collection structure:
```json
{
  "info": {
    "name": "TaskFlow API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{accessToken}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ]
}
```

2. Test sequence:
   - Register user → Save access token
   - Login → Verify token works
   - Create task → Save task ID
   - Submit bid → Save bid ID
   - Accept bid → Verify status change
   - Update task status → Verify progress tracking
   - Submit review → Verify review creation

### 7.2 Angular Frontend Integration

Update Angular services to call API endpoints:

**services/api.service.ts**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Auth
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  // Tasks
  getTasks(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/tasks`, {
      headers: this.getHeaders(),
      params
    });
  }

  createTask(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tasks`, data, {
      headers: this.getHeaders()
    });
  }

  updateTaskStatus(taskId: string, status: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/tasks/${taskId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  // ... implement all other endpoints
}
```

### 7.3 Deployment Checklist

#### Production Configuration
```json
// appsettings.Production.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-prod-server;Port=3306;Database=taskflow_db;User=prod_user;Password=strong_password;"
  },
  "JwtSettings": {
    "SecretKey": "YourProductionSecretKeyMustBeVerySecureAndLong!",
    "Issuer": "TaskFlowAPI",
    "Audience": "TaskFlowClient",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

#### Deploy to Azure/AWS/DigitalOcean
1. Set up MySQL database on cloud provider
2. Configure connection string with environment variables
3. Enable HTTPS
4. Set up CI/CD pipeline
5. Configure CORS for production domain
6. Enable logging and monitoring

---

## 8. Error Handling & Validation

### 8.1 Global Exception Handling

**Middleware/ExceptionHandlingMiddleware.cs**
```csharp
using Microsoft.AspNetCore.Http;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace TaskFlowAPI.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var code = HttpStatusCode.InternalServerError;
            var message = "An error occurred while processing your request.";

            switch (exception)
            {
                case UnauthorizedAccessException:
                    code = HttpStatusCode.Unauthorized;
                    message = "Unauthorized access";
                    break;
                case ArgumentException:
                case ArgumentNullException:
                    code = HttpStatusCode.BadRequest;
                    message = exception.Message;
                    break;
                case KeyNotFoundException:
                    code = HttpStatusCode.NotFound;
                    message = exception.Message;
                    break;
                case InvalidOperationException:
                    code = HttpStatusCode.BadRequest;
                    message = exception.Message;
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;

            var result = JsonSerializer.Serialize(new
            {
                error = message,
                statusCode = (int)code,
                timestamp = DateTime.UtcNow
            });

            return context.Response.WriteAsync(result);
        }
    }
}
```

### 8.2 Input Validation with FluentValidation

**Install Package:**
```bash
dotnet add package FluentValidation.AspNetCore
```

**Validators/CreateTaskValidator.cs**
```csharp
using FluentValidation;
using TaskFlowAPI.DTOs.Task;

namespace TaskFlowAPI.Validators
{
    public class CreateTaskValidator : AbstractValidator<CreateTaskDto>
    {
        public CreateTaskValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(200).WithMessage("Title cannot exceed 200 characters");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required")
                .MinimumLength(20).WithMessage("Description must be at least 20 characters")
                .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters");

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Category is required");

            RuleFor(x => x.BudgetMin)
                .GreaterThan(0).WithMessage("Minimum budget must be greater than 0");

            RuleFor(x => x.BudgetMax)
                .GreaterThan(x => x.BudgetMin).WithMessage("Maximum budget must be greater than minimum budget");

            RuleFor(x => x.PreferredDate)
                .GreaterThanOrEqualTo(DateTime.Today).WithMessage("Preferred date cannot be in the past");

            RuleFor(x => x.Location)
                .NotNull().WithMessage("Location is required");

            RuleFor(x => x.Location.State)
                .NotEmpty().When(x => x.Location != null).WithMessage("State is required");

            RuleFor(x => x.Location.City)
                .NotEmpty().When(x => x.Location != null).WithMessage("City is required");

            RuleFor(x => x.Location.FullAddress)
                .NotEmpty().When(x => x.Location != null).WithMessage("Full address is required");
        }
    }
}
```

**Program.cs Configuration:**
```csharp
using FluentValidation;
using FluentValidation.AspNetCore;

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateTaskValidator>();
```

### 8.3 Custom API Response Wrapper

**DTOs/Common/ApiResponse.cs**
```csharp
namespace TaskFlowAPI.DTOs.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public static ApiResponse<T> SuccessResponse(T data, string message = "Success")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        public static ApiResponse<T> ErrorResponse(string message, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
    }

    public class PaginatedResponse<T> : ApiResponse<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }

        public static PaginatedResponse<List<TItem>> CreatePaginatedResponse<TItem>(
            List<TItem> items, 
            int page, 
            int pageSize, 
            int totalCount)
        {
            return new PaginatedResponse<List<TItem>>
            {
                Success = true,
                Data = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }
    }
}
```

### 8.4 Model Validation Middleware

**Helpers/ValidationBehavior.cs**
```csharp
using FluentValidation;
using MediatR;

namespace TaskFlowAPI.Helpers
{
    public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        {
            _validators = validators;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (_validators.Any())
            {
                var context = new ValidationContext<TRequest>(request);
                var validationResults = await Task.WhenAll(_validators.Select(v => v.ValidateAsync(context, cancellationToken)));
                var failures = validationResults.SelectMany(r => r.Errors).Where(f => f != null).ToList();

                if (failures.Count != 0)
                {
                    throw new ValidationException(failures);
                }
            }

            return await next();
        }
    }
}
```

---

## 9. Performance Optimization

### 9.1 Database Indexing Strategy

The schema already includes essential indexes, but here are query-specific optimizations:

```sql
-- Composite indexes for common queries
CREATE INDEX idx_tasks_customer_status ON Tasks(CustomerId, Status);
CREATE INDEX idx_tasks_worker_status ON Tasks(WorkerId, Status);
CREATE INDEX idx_bids_task_status ON Bids(TaskId, Status);
CREATE INDEX idx_reviews_reviewee ON Reviews(RevieweeId, Rating);

-- Full-text search indexes (for MySQL 5.7+)
ALTER TABLE Tasks ADD FULLTEXT INDEX idx_tasks_search (Title, Description);
ALTER TABLE Users ADD FULLTEXT INDEX idx_users_search (Name, Email);

-- Optimize for date range queries
CREATE INDEX idx_tasks_date_range ON Tasks(PreferredDate, Status);
CREATE INDEX idx_disputes_date_status ON Disputes(CreatedDate, Status);
```

### 9.2 Caching with IMemoryCache

**Services/Implementations/CachedUserService.cs**
```csharp
using Microsoft.Extensions.Caching.Memory;

namespace TaskFlowAPI.Services.Implementations
{
    public class CachedUserService : IUserService
    {
        private readonly IUserService _userService;
        private readonly IMemoryCache _cache;
        private readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(15);

        public CachedUserService(IUserService userService, IMemoryCache cache)
        {
            _userService = userService;
            _cache = cache;
        }

        public async Task<UserDto?> GetUserByIdAsync(Guid userId)
        {
            var cacheKey = $"user_{userId}";
            
            if (_cache.TryGetValue(cacheKey, out UserDto? cachedUser))
            {
                return cachedUser;
            }

            var user = await _userService.GetUserByIdAsync(userId);
            
            if (user != null)
            {
                _cache.Set(cacheKey, user, _cacheDuration);
            }

            return user;
        }

        // Implement other methods with cache invalidation
    }
}
```

**Program.cs:**
```csharp
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.Decorate<IUserService, CachedUserService>();
```

### 9.3 Database Query Optimization

**Use AsNoTracking for Read-Only Queries:**
```csharp
public async Task<List<TaskDto>> GetAllTasksAsync()
{
    return await _context.Tasks
        .AsNoTracking()  // Improves performance for read-only queries
        .Include(t => t.Location)
        .Include(t => t.Bids)
        .Select(t => _mapper.Map<TaskDto>(t))
        .ToListAsync();
}
```

**Implement Pagination Efficiently:**
```csharp
public async Task<PaginatedResponse<List<TaskDto>>> GetTasksPaginatedAsync(int page, int pageSize)
{
    var totalCount = await _context.Tasks.CountAsync();
    
    var tasks = await _context.Tasks
        .AsNoTracking()
        .OrderByDescending(t => t.CreatedDate)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(t => _mapper.Map<TaskDto>(t))
        .ToListAsync();

    return PaginatedResponse<List<TaskDto>>.CreatePaginatedResponse(tasks, page, pageSize, totalCount);
}
```

---

## 10. Security Best Practices

### 10.1 Rate Limiting

**Install Package:**
```bash
dotnet add package AspNetCoreRateLimit
```

**appsettings.json:**
```json
{
  "IpRateLimiting": {
    "EnableEndpointRateLimiting": true,
    "StackBlockedRequests": false,
    "RealIpHeader": "X-Real-IP",
    "ClientIdHeader": "X-ClientId",
    "HttpStatusCode": 429,
    "GeneralRules": [
      {
        "Endpoint": "*",
        "Period": "1m",
        "Limit": 60
      },
      {
        "Endpoint": "*/api/auth/login",
        "Period": "15m",
        "Limit": 5
      },
      {
        "Endpoint": "*/api/auth/register",
        "Period": "1h",
        "Limit": 3
      }
    ]
  }
}
```

**Program.cs:**
```csharp
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

app.UseIpRateLimiting();
```

### 10.2 Data Protection & Encryption

**Encrypt Sensitive Data:**
```csharp
using System.Security.Cryptography;
using System.Text;

public class EncryptionService
{
    private readonly byte[] _key;
    private readonly byte[] _iv;

    public EncryptionService(IConfiguration configuration)
    {
        var encryptionKey = configuration["Encryption:Key"];
        _key = Encoding.UTF8.GetBytes(encryptionKey);
        _iv = Encoding.UTF8.GetBytes(encryptionKey.Substring(0, 16));
    }

    public string Encrypt(string plainText)
    {
        using var aes = Aes.Create();
        aes.Key = _key;
        aes.IV = _iv;

        var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream();
        using var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write);
        using (var sw = new StreamWriter(cs))
        {
            sw.Write(plainText);
        }

        return Convert.ToBase64String(ms.ToArray());
    }

    public string Decrypt(string cipherText)
    {
        using var aes = Aes.Create();
        aes.Key = _key;
        aes.IV = _iv;

        var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream(Convert.FromBase64String(cipherText));
        using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
        using var sr = new StreamReader(cs);

        return sr.ReadToEnd();
    }
}
```

### 10.3 SQL Injection Prevention

✅ **Always use parameterized queries** (EF Core does this automatically)  
✅ **Never concatenate user input** into SQL strings  
✅ **Use stored procedures** for complex operations  
✅ **Validate all input** before database operations

### 10.4 HTTPS & Security Headers

**Program.cs:**
```csharp
app.UseHttpsRedirection();
app.UseHsts();

app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "no-referrer");
    context.Response.Headers.Add("Content-Security-Policy", "default-src 'self'");
    await next();
});
```

---

## 11. Logging & Monitoring

### 11.1 Structured Logging with Serilog

**Install Packages:**
```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Sinks.Console
```

**Program.cs:**
```csharp
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithEnvironmentName()
    .Enrich.WithMachineName()
    .WriteTo.Console()
    .WriteTo.File("logs/taskflow-.log", 
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30)
    .CreateLogger();

builder.Host.UseSerilog();

// Log important events
app.Use(async (context, next) =>
{
    var stopwatch = Stopwatch.StartNew();
    await next();
    stopwatch.Stop();

    Log.Information(
        "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMilliseconds}ms",
        context.Request.Method,
        context.Request.Path,
        context.Response.StatusCode,
        stopwatch.ElapsedMilliseconds
    );
});
```

### 11.2 Health Checks

**Program.cs:**
```csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>()
    .AddMySql(builder.Configuration.GetConnectionString("DefaultConnection"));

app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false
});
```

---

## 12. Testing Strategy

### 12.1 Unit Tests Example

**TaskServiceTests.cs:**
```csharp
using Xunit;
using Moq;
using TaskFlowAPI.Services.Implementations;
using TaskFlowAPI.Repositories.Interfaces;

namespace TaskFlowAPI.Tests.Services
{
    public class TaskServiceTests
    {
        private readonly Mock<ITaskRepository> _taskRepositoryMock;
        private readonly TaskService _taskService;

        public TaskServiceTests()
        {
            _taskRepositoryMock = new Mock<ITaskRepository>();
            _taskService = new TaskService(_taskRepositoryMock.Object);
        }

        [Fact]
        public async Task CreateTask_ValidInput_ReturnsTask()
        {
            // Arrange
            var createTaskDto = new CreateTaskDto
            {
                Title = "Fix Leaky Pipe",
                Description = "Kitchen sink is leaking",
                Category = "plumber",
                BudgetMin = 500,
                BudgetMax = 2000
            };

            _taskRepositoryMock
                .Setup(repo => repo.CreateAsync(It.IsAny<Task>()))
                .ReturnsAsync(new Task { Id = Guid.NewGuid() });

            // Act
            var result = await _taskService.CreateTaskAsync(createTaskDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(createTaskDto.Title, result.Title);
            _taskRepositoryMock.Verify(repo => repo.CreateAsync(It.IsAny<Task>()), Times.Once);
        }

        [Fact]
        public async Task GetTaskById_NonExistentId_ReturnsNull()
        {
            // Arrange
            var taskId = Guid.NewGuid();
            _taskRepositoryMock
                .Setup(repo => repo.GetByIdAsync(taskId))
                .ReturnsAsync((Task?)null);

            // Act
            var result = await _taskService.GetTaskByIdAsync(taskId);

            // Assert
            Assert.Null(result);
        }
    }
}
```

### 12.2 Integration Tests

**TasksControllerIntegrationTests.cs:**
```csharp
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using Xunit;

namespace TaskFlowAPI.Tests.Integration
{
    public class TasksControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public TasksControllerIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetTasks_ReturnsSuccessStatusCode()
        {
            // Act
            var response = await _client.GetAsync("/api/tasks");

            // Assert
            response.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task CreateTask_ValidData_ReturnsCreatedTask()
        {
            // Arrange
            var newTask = new CreateTaskDto
            {
                Title = "Test Task",
                Description = "This is a test task description",
                Category = "plumber",
                BudgetMin = 500,
                BudgetMax = 1000
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/tasks", newTask);

            // Assert
            response.EnsureSuccessStatusCode();
            var createdTask = await response.Content.ReadFromJsonAsync<TaskDto>();
            Assert.NotNull(createdTask);
            Assert.Equal(newTask.Title, createdTask.Title);
        }
    }
}
```

---

## 13. Next Steps

After completing the basic implementation:

1. **File Upload**: Implement file storage for avatars, task photos, and evidence
   - Use Azure Blob Storage, AWS S3, or local file system
   - Add endpoints for file upload

2. **Real-time Features**: Add SignalR for:
   - Real-time bid notifications
   - Dispute chat messages
   - Task status updates

3. **Email Notifications**: 
   - Integrate SendGrid or SMTP
   - Send emails for task updates, bids, etc.

4. **Payment Integration**:
   - Integrate Razorpay, Stripe, or PayPal
   - Handle escrow payments

5. **Advanced Features**:
   - Search and filtering with Elasticsearch
   - Caching with Redis
   - Rate limiting
   - API versioning

---

## Summary

This guide provides a complete blueprint for migrating your TaskFlow application from localStorage to a production-ready backend with:

✅ **MySQL Database** with optimized schema  
✅ **.NET Core Web API** with clean architecture  
✅ **Entity Framework Core** with migrations  
✅ **JWT Authentication** with refresh tokens  
✅ **Role-based Authorization**  
✅ **Repository & Service Pattern**  
✅ **Complete API Documentation**  
✅ **Security Best Practices**

Follow the implementation steps sequentially, and you'll have a fully functional backend ready for production deployment!

---

**Need Help?**
- Check official documentation: https://docs.microsoft.com/aspnet/core
- Entity Framework Core: https://docs.microsoft.com/ef/core
- JWT Authentication: https://jwt.io

Good luck with your migration! 🚀
