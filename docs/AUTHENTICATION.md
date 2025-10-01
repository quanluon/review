# Authentication Setup Guide

This app supports multiple authentication methods with email verification.

## 🔐 Authentication Methods

### 1. Email/Password Authentication
- Standard email and password signup
- **Email verification required** before account activation
- Users receive a confirmation email with a magic link
- Once verified, users can log in

### 2. Social Authentication
- **Google OAuth**
- **GitHub OAuth**
- One-click signup/login
- No email verification needed (handled by the provider)

## 📧 Email Verification Flow

### How It Works

1. **User Signs Up**:
   - Enters name, email, and password
   - Clicks "Sign up"
   
2. **Confirmation Email Sent**:
   - User sees success message: "Check your email!"
   - Supabase sends verification email to the provided address
   
3. **User Clicks Link**:
   - Opens email
   - Clicks verification link
   - Automatically redirected to `/app`
   
4. **Account Activated**:
   - User can now log in normally
   - Full access to the app

### Email Templates

Supabase provides default email templates. You can customize them in the Supabase Dashboard:

1. Go to **Authentication** → **Email Templates**
2. Edit the "Confirm signup" template
3. Customize the design and text
4. Use variables like `{{ .ConfirmationURL }}`

## 🔧 Supabase Configuration

### Enable Email Confirmation

In your Supabase project:

1. Go to **Authentication** → **Settings**
2. Under "Email Auth", enable:
   - ✅ **Enable email confirmations**
   - ✅ **Enable email signups**
3. Set **Site URL** to your production URL (e.g., `https://yourapp.vercel.app`)
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourapp.vercel.app/auth/callback` (production)

### Configure Google OAuth

1. **Create Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```

2. **Configure in Supabase**:
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Enter **Client ID** and **Client Secret** from Google
   - Save

### Configure GitHub OAuth

1. **Create GitHub OAuth App**:
   - Go to [GitHub Settings](https://github.com/settings/developers)
   - Click **New OAuth App**
   - **Application name**: Your App Name
   - **Homepage URL**: `https://yourapp.vercel.app`
   - **Authorization callback URL**:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
   - Click **Register application**
   - Copy **Client ID** and generate a **Client Secret**

2. **Configure in Supabase**:
   - Go to **Authentication** → **Providers**
   - Enable **GitHub**
   - Enter **Client ID** and **Client Secret** from GitHub
   - Save

## 📱 User Experience

### Login Page (`/login`)
- Email/password form
- "Or continue with" divider
- Google button
- GitHub button
- Link to signup page

### Signup Page (`/signup`)
- Name, email, password form
- Success message with email verification instructions
- "Or continue with" divider
- Google button
- GitHub button
- Link to login page

### Verify Email Page (`/verify-email`)
- Shown to users who haven't verified their email
- Instructions to check email
- Link back to login

### OAuth Callback (`/auth/callback`)
- Handles OAuth redirects
- Exchanges code for session
- Redirects to `/app`

## 🔒 Security Features

### Row Level Security (RLS)
All database tables have RLS enabled:
- Users can only modify their own data
- Public read access for reviews and places
- Authenticated users can create content

### Session Management
- Sessions stored in HTTP-only cookies
- Automatic refresh tokens
- Middleware protects `/app` routes

## 🚀 Testing Locally

### 1. Email Authentication

```bash
# Start the dev server
npm run dev
```

1. Go to `http://localhost:3000/signup`
2. Create an account
3. Check Supabase Dashboard → Authentication → Users
4. Copy the confirmation URL from the logs
5. Visit the URL to verify email

**Note**: In development, confirmation emails won't be sent unless you configure an SMTP provider in Supabase.

### 2. Social Authentication

1. Configure OAuth providers as described above
2. Go to `http://localhost:3000/login`
3. Click "Continue with Google" or "Continue with GitHub"
4. Authorize the app
5. You'll be redirected to `/app`

## 📧 SMTP Configuration (Production)

For production email sending:

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Enable **SMTP**
4. Configure your SMTP provider (SendGrid, Mailgun, etc.):
   ```
   Host: smtp.sendgrid.net
   Port: 587
   User: apikey
   Password: YOUR_SENDGRID_API_KEY
   Sender email: noreply@yourdomain.com
   Sender name: Your App Name
   ```

Popular SMTP providers:
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free
- **AWS SES**: Pay as you go
- **Resend**: 3,000 emails/month free

## 🔍 Troubleshooting

### Email Not Received
- Check spam folder
- Verify SMTP settings in Supabase
- Check Supabase logs for delivery errors
- Ensure "Enable email confirmations" is ON

### OAuth Not Working
- Verify redirect URLs match exactly
- Check client ID and secret are correct
- Ensure OAuth app is not in development mode (GitHub)
- Check browser console for errors

### "Email not confirmed" Error
- User needs to click verification link
- Check Supabase Dashboard → Authentication → Users
- Manually confirm user in dashboard if needed

## 💡 Best Practices

1. **Email Verification**:
   - Always require email verification in production
   - Provides security and reduces spam accounts
   
2. **OAuth**:
   - Use for better UX
   - Reduces friction in signup process
   - Leverages existing user trust in Google/GitHub
   
3. **Error Handling**:
   - Show clear error messages
   - Provide help links
   - Log errors for debugging
   
4. **Rate Limiting**:
   - Supabase has built-in rate limiting
   - Configure in Dashboard → Settings → Rate Limits

## 📝 Code Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        # Login page
│   │   ├── signup/page.tsx       # Signup page
│   │   └── verify-email/page.tsx # Email verification page
│   ├── auth/
│   │   └── callback/route.ts     # OAuth callback handler
│   └── api/
│       └── auth/
│           ├── signin/route.ts   # Email signin API
│           ├── signup/route.ts   # Email signup API
│           └── signout/route.ts  # Signout API
├── components/
│   └── auth/
│       ├── login-form.tsx        # Login form component
│       ├── signup-form.tsx       # Signup form component
│       └── social-auth.tsx       # Social auth buttons
├── hooks/
│   └── use-auth.ts               # Authentication hook
└── lib/
    └── supabase/
        ├── client.ts             # Browser Supabase client
        ├── server.ts             # Server Supabase client
        └── middleware.ts         # Auth middleware
```

## 🎯 Next Steps

1. **Configure OAuth providers** in Supabase Dashboard
2. **Set up SMTP** for production email sending
3. **Customize email templates** with your branding
4. **Test the full flow** from signup to email verification
5. **Add password reset** functionality (optional)
6. **Implement 2FA** for enhanced security (optional)

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

