import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

let isSetup = false;

export function setupPassport() {
  if (isSetup) return;

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  
  // ✅ ENV based callback URL (REQUIRED for production)
  // Must match exactly with Google Cloud Console Authorized redirect URIs
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;
  
  // Fallback only for local development if not set
  const finalCallbackURL = callbackURL || (process.env.NODE_ENV !== 'production' 
    ? 'http://localhost:5000/api/auth/google/callback' 
    : null);

  if (!finalCallbackURL) {
    console.error('[passport] ERROR: GOOGLE_CALLBACK_URL is required in production!');
  }

  console.log('[passport] Google OAuth Configuration:', {
    hasClientId: !!GOOGLE_CLIENT_ID,
    hasClientSecret: !!GOOGLE_CLIENT_SECRET,
    callbackURL: finalCallbackURL,
    callbackURLSource: callbackURL ? 'GOOGLE_CALLBACK_URL env var' : 'fallback (dev only)',
    nodeEnv: process.env.NODE_ENV,
  });

  // Only register GoogleStrategy if credentials are provided
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && finalCallbackURL) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: finalCallbackURL,
        },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = (profile.emails && profile.emails[0]?.value) || '';
          const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
          const avatar = (profile.photos && profile.photos[0]?.value) || '';

          console.log('Google profile:', {
            id: profile.id,
            displayName: profile.displayName,
            emails: profile.emails,
            photos: profile.photos,
            name: profile.name,
            provider: profile.provider,
          });

          // Prefer lookup by googleId
          let user = await User.findOne({ googleId });
          if (!user && email) {
            // Fallback: link existing account by email
            user = await User.findOne({ email });
          }

          if (!user) {
            user = await User.create({
              name: name || 'Google User',
              email,
              googleId,
              avatar,
              provider: 'google',
            });
            console.log('User saved:', { id: String(user._id), email: user.email, googleId: user.googleId });
          } else {
            // Update google fields if needed
            const updates = {};
            if (!user.googleId) updates.googleId = googleId;
            if (avatar && user.avatar !== avatar) updates.avatar = avatar;
            if (user.provider !== 'google') updates.provider = 'google';
            if (Object.keys(updates).length) {
              user.set(updates);
              await user.save();
              console.log('User saved:', { id: String(user._id), email: user.email, googleId: user.googleId });
            }
          }
          return done(null, user);
        } catch (err) {
          console.error('[GoogleStrategy] Error during authentication:', err);
          return done(err, null);
        }
      }
    )
    );
    console.log('[passport] Google OAuth strategy registered with callbackURL:', finalCallbackURL);
  } else {
    const missing = [];
    if (!GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
    if (!GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
    if (!finalCallbackURL) missing.push('GOOGLE_CALLBACK_URL');
    console.warn('[passport] Google OAuth disabled: Missing', missing.join(', '));
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('name email isAdmin googleId avatar provider');
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  isSetup = true;
}

export default passport;
