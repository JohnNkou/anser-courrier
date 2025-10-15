=== GravityView - Multiple Forms ===
Requires at least: 4.4
Tested up to: 6.7.1
Requires PHP: 7.2
Stable tag: 0.5.1
Contributors: The GravityKit Team
License: GPL 2

Display values from multiple forms in a single View.

== Description ==

Display values from multiple forms in a single View. Learn more on [gravitykit.com](https://www.gravitykit.com/extensions/multiple-forms/).

== Installation ==

1. Upload plugin files to your plugins folder, or install using WordPress's built-in Add New Plugin installer
2. Activate the plugin
3. Follow the instructions

== Changelog ==

= 0.5.1 on April 9, 2025 =

This update fixes sorting issues affecting joined data in Views.

#### 🐛 Fixed
* Sorting Views by fields from joined forms, including the field used to create the join, was not working.

= 0.5.0 on March 10, 2025 =

This release introduces an option to control the visibility of unapproved joined entries, refactors join logic for better filtering, and resolves issues with missing or incorrectly displayed joined entries.

#### 🚀 Added
* New 'Show only approved joined entries' setting in the View editor to control the display of unapproved or disapproved joined entries.

#### ✨ Improved
* Reworked join logic for more flexible filtering.
* Multiple join conditions on the same form are now processed within a single join, ensuring all conditions apply together.

#### 🐛 Fixed
* Some related joined entries were missing from the View.
* Unapproved joined entries were incorrectly displayed in the View.

#### 💻 Developer Updates
* Added: `gk/multiple-forms/query/handler/join/conditions` filter to modify conditions for a joined form query.

= 0.4.0 on December 19, 2024 =

This release adds support for different View types in the View editor and fixes issues with sorting and missing parent form entries.

#### 🚀 Added
* Support for using different View types in the Multiple Entries and Single Entry layouts (requires GravityView 2.26.1 or newer).
* Compatibility with the upcoming Layout Builder View type in GravityView.

#### 🐛 Fixed
* Trashed entries in a joined form prevented related entries from the parent form from displaying in the View.
* Sorting on joined fields did not work properly.
* Sorting by one field (column) would instead sort by another.

= 0.3.8 on December 5, 2023 =

* Fixed: Fatal error when editing fields with GravityEdit if the View uses joined forms

= 0.3.7 on November 17, 2023 =

* Fixed: Missing option to add fields from joined forms in the View editor when using GravityView 2.19.4 or newer

= 0.3.6 on November 16, 2023 =

* Fixed: Performance issue caused by Multiple Forms modifying database queries, even when not needed
* Fixed: Linking to the Single Entry from a View with joins now works as expected (with joined entry IDs separated by commas)

= 0.3.5 on June 8, 2023 =

* Fixed: Fatal error that prevents the ability to create a new View

= 0.3.4 on May 16, 2023 =

* Fixed: Fatal error when running less than PHP 8.0

= 0.3.3 on May 16, 2023 =

* Improved: Display an admin notice when GravityView or Gravity Forms are not installed and activated
* Fixed: `'GravityKit\MultipleForms\GF_Query_JSON_Literal' not found` fatal error when performing a search on a View
* Fixed: Joining two Views using "any form field" joins can cause fatal errors

= 0.3.2 on May 1, 2023 =

* Fixed: Fatal error when GravityView is not activated (introduced in Version 0.3)

= 0.3.1 on April 19, 2023 =

* Fixed: PHP warning

= 0.3 Beta 3 on April 19, 2023 =

* Fixed: Fatal error related to namespacing

= 0.3 Beta 2 on April 18, 2023 =

* Fixed: Fatal error when activating the extension

= 0.3 Beta 1 on April 17, 2023 =

* Added: You can now sort Views by joined form fields
* Modified: Minimum version of PHP bumped to 7.2 to match all other GravityKit plugins
* Fixed: When field ids across joined forms were the same, values could be pulled from the wrong form
* Fixed: View editor became unusable when a joined form was trashed or deleted
* Fixed: When "Show only approved entries" was enabled for a View, it was behaving as if "Strict Entry Match" were also enabled

= 0.2 Beta 2 on June 10, 2020 =

* Fixed: Conflict preventing Yoast SEO scripts from running on Views

= 0.2 Beta 1 on May 25, 2020 =

* Added: Allow joining forms on field meta and properties
    - Adds support for [Nested Forms by GravityWiz](https://gravitywiz.com/?ref=63)!
* Added: Allow joining multiple forms on entry meta (non-field data)
* Added: `gravityview_multiple_forms/allow_join_on` filter for developers to modify the list of permissible meta and properties
* Added: Italian and Persian translations (Thanks, Farhad P.!)
* Improved: Do not require a published View to display join conditions
* Modified: Now requires GravityView 2.6 or newer
* Fixed: Fatal error when using Gravity Forms 2.2 or older
* Fixed: "Cannot read property 'title' of undefined" JavaScript error

= 0.1 Beta 2 =

* Fixed: PHP Warning: `Declaration of GF_Patched_Query::_prime_joins() should be compatible with GF_Query::_prime_joins()`

= 0.1 Beta 1 =

* Liftoff!
