<?php
define( 'WP_CACHE', true );
 // Added by AirLift
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */
// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'u776474273_23sB7' );
/** Database username */
define( 'DB_USER', 'u776474273_cWW68' );
/** Database password */
define( 'DB_PASSWORD', 'yyLHemHInL' );
/** Database hostname */
define( 'DB_HOST', '127.0.0.1' );
/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );
/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );
/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          'j`c+p[HN?]N0fqb@ x2jL98EnIhQN1KI4OST#5s_L{%7JEKK6<(ND42rG6QLNn-,' );
define( 'SECURE_AUTH_KEY',   'fP:0Cdc2!G}<e0cbqg6G1l%b?N.u]e8Vw;Nm=888i/2Z+8~j?bCTIpwg?Ou*%~1{' );
define( 'LOGGED_IN_KEY',     'pJa^d;;<eLJ=8]?@MCS;Q)}>y!;.Q#4~iXidu0g[Mk|V@j#l?L3>m$y0YA6^>u&p' );
define( 'NONCE_KEY',         'uZs3 Qwea>t|+L~cboHk{ZotFUT|e&Ne|z=!_z;ayLbug[z&-%Chqm7*iA}U:s9B' );
define( 'AUTH_SALT',         '^M i_ Kmroa$uA<_3l{zAE4 ^9-]Gf^_KkII0rB4bl):|=jcp:Q1?10C<r.GSB+C' );
define( 'SECURE_AUTH_SALT',  'Uk(m3(E2c3a(i.a;^(E[F]vrJA_OXd{FemYCFjLj_B|Su;^g3sE8+<SqK5;->iyo' );
define( 'LOGGED_IN_SALT',    'q<Ol3$y]xM`yJ(!0{av?Bdo}(8VWs6nm%q~qW~w$|$N^4hv lu/%^*MZ7&J$WM@O' );
define( 'NONCE_SALT',        '7,^+??KM1i(bP3H*ZLK=F`dOU745_tIAM(a626=tX&eGMD=cwev}~E@#sxA%%.Ns' );
define( 'WP_CACHE_KEY_SALT', 'wZwn&),,izMB]E@Pn9vN}z*MLrP8h#@V00U,<g5_E@ppw$~.(TLLrOED[s}K(35s' );
/**#@-*/
/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';
/* Add any custom values between this line and the "stop editing" line. */
/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', mangue ); 
    define( 'WP_DEBUG_LOG', true ); 
    define( 'WP_DEBUG_DISPLAY', false ); 
}
define( 'FS_METHOD', 'direct' );
define( 'COOKIEHASH', 'adc12cf997ae1aedac34b14d110c4c43' );
define( 'WP_AUTO_UPDATE_CORE', 'minor' );
/* That's all, stop editing! Happy publishing. */
/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}
/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
