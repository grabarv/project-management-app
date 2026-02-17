namespace ProjectManagement.Api.Services;

public sealed class OperationResult<T>
{
    private OperationResult(bool success, int statusCode, T? value, string? error)
    {
        Success = success;
        StatusCode = statusCode;
        Value = value;
        Error = error;
    }

    public bool Success { get; }
    public int StatusCode { get; }
    public T? Value { get; }
    public string? Error { get; }

    public static OperationResult<T> Ok(T value) => new(true, 200, value, null);
    public static OperationResult<T> Created(T value) => new(true, 201, value, null);
    public static OperationResult<T> Fail(int statusCode, string error) => new(false, statusCode, default, error);
}
