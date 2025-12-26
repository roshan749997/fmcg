import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

function generateJwt(userId) {
  const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
  // Use 'id' for consistency with Google and OTP login
  return jwt.sign({ id: String(userId) }, jwtSecret, { expiresIn: '7d' });
}

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash });

    const token = generateJwt(user.id);
    return res.status(201).json({
      message: 'Account created',
      user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Signup failed', error: err.message });
  }
}

export async function signin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateJwt(user.id);
    return res.json({
      message: 'Signed in',
      user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Signin failed', error: err.message });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If account exists, email sent' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = expires;
    await user.save();

    // Normally send email with link containing token; for now, return token
    return res.json({ message: 'Reset token generated', token });
  } catch (err) {
    return res.status(500).json({ message: 'Forgot password failed', error: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.passwordHash = await User.hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    return res.json({ message: 'Password updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Reset password failed', error: err.message });
  }
}

export default { signup, signin, forgotPassword, resetPassword };
