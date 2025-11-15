using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SocialNetwork.Application.Interfaces;

namespace SocialNetwork.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<FileStorageService> _logger;
    private readonly string _uploadPath;
    private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB
    private readonly string[] _allowedImageTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };
    private readonly string[] _allowedVideoTypes = { "video/mp4", "video/webm", "video/ogg" };
    private readonly string[] _allowedDocTypes = { "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };

    public FileStorageService(IConfiguration configuration, ILogger<FileStorageService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _uploadPath = _configuration["FileStorage:UploadPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");

        // Create upload directory if it doesn't exist
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        try
        {
            // Validate file
            if (!ValidateFile(fileName, fileStream.Length, contentType))
            {
                throw new InvalidOperationException("Invalid file");
            }

            // Generate unique file name
            var extension = Path.GetExtension(fileName);
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(_uploadPath, uniqueFileName);

            // Save file
            using var fileStreamOutput = new FileStream(filePath, FileMode.Create);
            await fileStream.CopyToAsync(fileStreamOutput, cancellationToken);

            _logger.LogInformation("File uploaded successfully: {FileName}", uniqueFileName);

            // Return relative URL
            return $"/uploads/{uniqueFileName}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file: {FileName}", fileName);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            var fileName = Path.GetFileName(fileUrl);
            var filePath = Path.Combine(_uploadPath, fileName);

            if (File.Exists(filePath))
            {
                await Task.Run(() => File.Delete(filePath), cancellationToken);
                _logger.LogInformation("File deleted successfully: {FileName}", fileName);
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file: {FileUrl}", fileUrl);
            return false;
        }
    }

    public async Task<Stream> DownloadFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        var fileName = Path.GetFileName(fileUrl);
        var filePath = Path.Combine(_uploadPath, fileName);

        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException("File not found", fileName);
        }

        var memory = new MemoryStream();
        using var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        await stream.CopyToAsync(memory, cancellationToken);
        memory.Position = 0;

        return memory;
    }

    public Task<bool> FileExistsAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        var fileName = Path.GetFileName(fileUrl);
        var filePath = Path.Combine(_uploadPath, fileName);
        return Task.FromResult(File.Exists(filePath));
    }

    public bool ValidateFile(string fileName, long fileSize, string contentType)
    {
        // Check file size
        if (fileSize > _maxFileSize)
        {
            _logger.LogWarning("File size exceeds limit: {FileName} ({FileSize} bytes)", fileName, fileSize);
            return false;
        }

        // Check file extension
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm", ".pdf", ".doc", ".docx" };

        if (!allowedExtensions.Contains(extension))
        {
            _logger.LogWarning("Invalid file extension: {FileName}", fileName);
            return false;
        }

        // Check content type
        var allowedTypes = _allowedImageTypes.Concat(_allowedVideoTypes).Concat(_allowedDocTypes);
        if (!allowedTypes.Contains(contentType.ToLowerInvariant()))
        {
            _logger.LogWarning("Invalid content type: {ContentType} for file {FileName}", contentType, fileName);
            return false;
        }

        return true;
    }
}
