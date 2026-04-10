using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Application.DTOs.GoogleDto
{
    public class GoogleAuthDto
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; }= string.Empty;
        public string GoogleId { get; set; } =string.Empty;
        public string PhotoUrl { get; set; } = string.Empty;
    }
}
