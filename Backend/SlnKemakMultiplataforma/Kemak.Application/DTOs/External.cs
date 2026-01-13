using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kemak.Application.DTOs
{
    public class DecolectaDniResponse
    {
        public string first_name { get; set; } = null!;
        public string first_last_name { get; set; } = null!;
        public string second_last_name { get; set; } = null!;
        public string full_name { get; set; } = null!;
        public string document_number { get; set; } = null!;
    }
}
