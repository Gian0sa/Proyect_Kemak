using Kemak.Application.DTOs.ImagenDto;
using Microsoft.AspNetCore.Http;

namespace Kemak.Application.Interfaces
{
    public interface ICloudinaryService
    {
        // Recibe el archivo del formulario y devuelve la URL y el PublicId
        Task<CloudinaryResponseDto> UploadImageAsync(IFormFile file);
        Task<bool> DeleteImageAsync(string publicId);
    }

   
}