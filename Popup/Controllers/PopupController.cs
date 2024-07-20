using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OpenAI_API;
using OpenAI_API.Completions;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Popup.Controllers
{


    [Route("api/[controller]")]
    [ApiController]
    public class PopupController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _openAiApiKey = "sk-proj-3TvfAI4tO1tq0WnItJmQT3BlbkFJgxmMrsz5B0633Qt9dPnr"; // Use a secure way to store the key

        public PopupController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet("getWord/{word}")]
        public IActionResult GetWord(string word)
        {
            try
            {
                var data = new { Message = $"You selected: {word}" };
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("sendToOpenAI")]
        public async Task<IActionResult> SendToOpenAI([FromBody] string word)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_openAiApiKey}");

                var requestData = new
                {
                    model = "gpt-3.5-turbo-instruct",
                    prompt = $"Explain the word: {word}",
                    max_tokens = 50,
                    temperature = 0.7
                };

                var jsonContent = new StringContent(JsonSerializer.Serialize(requestData), Encoding.UTF8, "application/json");
                var response = await client.PostAsync("https://api.openai.com/v1/completions", jsonContent);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, errorContent);
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var jsonResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                var explanation = jsonResponse.GetProperty("choices")[0].GetProperty("text").GetString();

                return Ok(new { Message = explanation });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }

}
