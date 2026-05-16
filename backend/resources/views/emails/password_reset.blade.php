<!DOCTYPE html>
<html>
<head>
    <title>Recuperación de Contraseña - FitCoach Pro</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #4f46e5; text-align: center;">FitCoach Pro</h2>
        <p style="color: #3f3f46; font-size: 16px;">Hola,</p>
        <p style="color: #3f3f46; font-size: 16px;">Has solicitado restablecer tu contraseña. Hemos generado una nueva contraseña temporal para ti:</p>
        
        <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #18181b; letter-spacing: 2px;">{{ $newPassword }}</span>
        </div>
        
        <p style="color: #3f3f46; font-size: 16px;">Inicia sesión con esta contraseña. Por seguridad, el sistema te pedirá que crees una nueva contraseña inmediatamente después de ingresar.</p>
        
        <p style="color: #71717a; font-size: 14px; margin-top: 30px;">Si no solicitaste este cambio, por favor ignora este correo o contacta a soporte.</p>
    </div>
</body>
</html>
