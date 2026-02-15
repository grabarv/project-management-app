var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();


app.MapPost("/api/auth/signup", (SignUpRequest request) =>
{
    Console.WriteLine("=== SIGN UP REQUEST RECEIVED ===");
    Console.WriteLine($"Username: {request.Username}");
    Console.WriteLine($"Email: {request.Email}");
    Console.WriteLine($"Password: {request.Password}");
    Console.WriteLine("===============================");

    return Results.Ok(new { message = "Sign-up data received" });
})
.WithName("SignUp");

app.Run();

record SignUpRequest(string Username, string Email, string Password);
