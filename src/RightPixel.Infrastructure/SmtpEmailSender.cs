using System.Net;
using System.Net.Mime;
using System.Text;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using RightPixel.Application;
namespace RightPixel.Infrastructure;
public sealed class SmtpEmailSender(IConfiguration config) : IEmailSender
{
    public async Task SendCode(string email, string code)
    {
        using var smtp = new SmtpClient(config["EmailSettings:Host"], int.TryParse(config["EmailSettings:Port"], out var port) ? port : 587) { EnableSsl = true, Credentials = new NetworkCredential(config["EmailSettings:UserName"], config["EmailSettings:Password"]) };
        using var message = new MailMessage { From = new MailAddress(config["EmailSettings:FromEmail"]!, "RightPixel"), Subject = "کد تأیید ایمیلت در RightPixel", SubjectEncoding = Encoding.UTF8, BodyEncoding = Encoding.UTF8 };
        using var template = typeof(SmtpEmailSender).Assembly.GetManifestResourceStream("RightPixel.VerificationEmail.html")
            ?? throw new InvalidOperationException("Verification email template is missing.");
        using var reader = new StreamReader(template, Encoding.UTF8);
        var html = (await reader.ReadToEndAsync()).Replace("{{code}}", WebUtility.HtmlEncode(code));
        var text = $"سلام قهرمان!\nبرای تأیید ایمیل و ساخت یا بازیابی رمز RightPixel، این کد را در صفحهٔ بازی وارد کن:\n{code}\nاین کد تا ۲ دقیقه معتبر است و فقط یک بار استفاده می‌شود.\nاگر این درخواست را انجام ندادی، نیازی به اقدامی نیست. کد را در اختیار دیگران نگذار.";
        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(text, Encoding.UTF8, MediaTypeNames.Text.Plain));
        message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(html, Encoding.UTF8, MediaTypeNames.Text.Html));
        message.To.Add(email);
        await smtp.SendMailAsync(message).WaitAsync(TimeSpan.FromSeconds(8));
    }
}
