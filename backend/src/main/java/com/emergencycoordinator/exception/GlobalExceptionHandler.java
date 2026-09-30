package com.emergencycoordinator.exception;
import java.time.LocalDateTime; import java.util.Map;
import org.springframework.http.*; import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException; import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
@RestControllerAdvice
public class GlobalExceptionHandler {
    private ResponseEntity<Map<String, Object>> body(HttpStatus s, String m) {
        return ResponseEntity.status(s).body(Map.of("status", s.value(), "error", s.getReasonPhrase(), "message", m, "timestamp", LocalDateTime.now().toString()));
    }
    @ExceptionHandler(ResourceNotFoundException.class) ResponseEntity<Map<String, Object>> notFound(ResourceNotFoundException e) { return body(HttpStatus.NOT_FOUND, e.getMessage()); }
    @ExceptionHandler(InvalidRequestException.class) ResponseEntity<Map<String, Object>> invalid(InvalidRequestException e) { return body(HttpStatus.BAD_REQUEST, e.getMessage()); }
    @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException e) {
        return body(HttpStatus.BAD_REQUEST, e.getBindingResult().getFieldErrors().stream().map(f -> f.getDefaultMessage()).reduce((a, b) -> a + "; " + b).orElse("Validation failed"));
    }
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class}) ResponseEntity<Map<String, Object>> badValue(Exception e) {
        return body(HttpStatus.BAD_REQUEST, "Malformed request or invalid enum value (type, priority or status)");
    }
}
