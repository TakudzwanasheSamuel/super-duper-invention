/**
 * Babel config for myBudget.
 *
 * - In development we keep all console.* calls so Metro shows useful logs.
 * - In production builds (EAS / `expo export`), we strip every console.*
 *   call to reduce bundle size and to avoid leaking debug info to release users.
 *   Errors that genuinely need to surface in production should go through a
 *   real reporter (Sentry/Crashlytics) once it's wired up.
 */
module.exports = function (api) {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    presets: ['babel-preset-expo'],
    plugins: isProduction ? ['transform-remove-console'] : [],
  };
};
