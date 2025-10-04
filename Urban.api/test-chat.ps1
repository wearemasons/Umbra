# Urban API Chat Test Script
# This script demonstrates how to use the chat functionality

Write-Host "=== Urban API Chat Test ===" -ForegroundColor Green

# Base URL
$baseUrl = "http://localhost:5064"

# Step 1: Register a new user
Write-Host "`n1. Registering a new user..." -ForegroundColor Yellow
$registerBody = @{
    email = "chatuser@example.com"
    password = "password123"
    fullName = "Chat Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body $registerBody
    $token = $registerResponse.token
    Write-Host "✅ User registered successfully!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0,50))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Set up headers for authenticated requests
$headers = @{
    "Authorization" = "Bearer $token"
}

# Step 3: Get current user info
Write-Host "`n2. Getting current user info..." -ForegroundColor Yellow
try {
    $userInfo = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers
    Write-Host "✅ User info retrieved!" -ForegroundColor Green
    Write-Host "User: $($userInfo.fullName) ($($userInfo.email))" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get user info: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Create a new chat
Write-Host "`n3. Creating a new chat..." -ForegroundColor Yellow
$chatBody = @{
    title = "Test Chat - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
} | ConvertTo-Json

try {
    $chatResponse = Invoke-RestMethod -Uri "$baseUrl/api/chat" -Method POST -ContentType "application/json" -Body $chatBody -Headers $headers
    $chatId = $chatResponse.id
    Write-Host "✅ Chat created successfully!" -ForegroundColor Green
    Write-Host "Chat ID: $chatId" -ForegroundColor Gray
    Write-Host "Chat Title: $($chatResponse.title)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create chat: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 5: Send messages to the chat
Write-Host "`n4. Sending messages to the chat..." -ForegroundColor Yellow

$messages = @(
    @{ content = "Hello! This is my first message in this chat."; role = "User" },
    @{ content = "Hi there! How can I help you today?"; role = "Assistant" },
    @{ content = "I'm testing the chat functionality. Can you tell me about urban planning?"; role = "User" },
    @{ content = "Urban planning is a multidisciplinary field that focuses on the development and design of land use and the built environment. It involves creating sustainable communities, managing transportation systems, and ensuring equitable access to resources."; role = "Assistant" }
)

foreach ($message in $messages) {
    $messageBody = $message | ConvertTo-Json
    try {
        $messageResponse = Invoke-RestMethod -Uri "$baseUrl/api/chat/$chatId/messages" -Method POST -ContentType "application/json" -Body $messageBody -Headers $headers
        Write-Host "✅ Message sent: $($message.content.Substring(0, [Math]::Min(50, $message.content.Length)))..." -ForegroundColor Green
        Start-Sleep -Milliseconds 500
    } catch {
        Write-Host "❌ Failed to send message: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 6: Get the chat with all messages
Write-Host "`n5. Retrieving chat with messages..." -ForegroundColor Yellow
try {
    $chatDetails = Invoke-RestMethod -Uri "$baseUrl/api/chat/$chatId" -Method GET -Headers $headers
    Write-Host "✅ Chat retrieved successfully!" -ForegroundColor Green
    Write-Host "Chat Title: $($chatDetails.title)" -ForegroundColor Gray
    Write-Host "Message Count: $($chatDetails.messages.Count)" -ForegroundColor Gray
    
    Write-Host "`n--- Chat Messages ---" -ForegroundColor Cyan
    foreach ($msg in $chatDetails.messages) {
        $roleColor = if ($msg.role -eq "User") { "Blue" } else { "Magenta" }
        Write-Host "[$($msg.role)]: $($msg.content)" -ForegroundColor $roleColor
    }
} catch {
    Write-Host "❌ Failed to retrieve chat: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 7: Get all user chats
Write-Host "`n6. Getting all user chats..." -ForegroundColor Yellow
try {
    $allChats = Invoke-RestMethod -Uri "$baseUrl/api/chat" -Method GET -Headers $headers
    Write-Host "✅ Retrieved all chats!" -ForegroundColor Green
    Write-Host "Total Chats: $($allChats.Count)" -ForegroundColor Gray
    
    foreach ($chat in $allChats) {
        Write-Host "  - $($chat.title) (ID: $($chat.id), Messages: $($chat.messageCount))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed to retrieve chats: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "You can now use the Swagger UI at http://localhost:5064/swagger to explore more features!" -ForegroundColor Cyan

