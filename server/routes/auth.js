const router = require('express').Router();
const passport = require('passport');

const ADMIN_REDIRECT = process.env.ADMIN_REDIRECT || `${process.env.FRONTEND_URL || 'https://noblesweb.design'}/admin`;
const failureRedirect = `${ADMIN_REDIRECT}${ADMIN_REDIRECT.includes('?') ? '&' : '?'}error=github`;

const startGithubAuth = (req, _res, next) => {
  console.log('GitHub OAuth start hit', { path: req.path, query: req.query });
  next();
};

const handleGithubCallback = (req, res, next) => {
  console.log('GitHub OAuth callback hit', { path: req.path, query: req.query });

  const authenticate = passport.authenticate(
    'github',
    {
      failureRedirect,
      session: true,
    },
    (err, user, info) => {
      if (err || !user) {
        console.log('GitHub OAuth failure', { error: err?.message, info });
        if (!res.headersSent) {
          return res.redirect(failureRedirect);
        }
        return;
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.log('GitHub OAuth login error', loginErr);
          return next(loginErr);
        }

        console.log('GitHub OAuth success', { userId: user.id, githubId: user.githubId });
        return res.redirect(ADMIN_REDIRECT);
      });
    }
  );

  authenticate(req, res, next);
};

router.get(['/auth/github', '/api/auth/github'], startGithubAuth, passport.authenticate('github', { scope: ['user:email'] }));

router.get(['/auth/github/callback', '/api/auth/github/callback'], handleGithubCallback);

module.exports = router;
