<?php
namespace GravityKit\MultipleForms\Entry;

use GV\Context;
use GV\Entry;
use GV\Multi_Entry;

/**
 * Class MultiEntryWithContext
 *
 * @since   TBD
 *
 * @package GravityKit\MultipleForms\Entry
 */
class MultiEntryWithContext extends Multi_Entry {
	/**
	 * @since 0.3.6
	 *
	 * @var Context
	 */
	protected $context;

	/**
	 * MultiEntryWithContext constructor.
	 *
	 * We specifically need to create a constructor here to prevent the parent constructor from being called, since that one is private.
	 *
	 * @since 0.3.6
	 */
	private function __construct() {
		// intentionally empty.
	}

	/**
	 * Sets the Context on this Multi Entry.
	 *
	 * @since 0.3.6
	 *
	 * @param Context $context
	 */
	public function set_context( Context $context ): void {
		$this->context = $context;
	}

	/**
	 * Gets the Context set on this Multi Entry.
	 *
	 * @since 0.3.6
	 *
	 * @return Context
	 */
	public function get_context(): Context {
		return $this->context;
	}

	/**
	 * Create a multi entry with context, which allows each value to be returned properly.
	 *
	 * @since 0.3.6
	 *
	 * @param Multi_Entry $entry
	 * @param Context     $context
	 *
	 * @return self
	 */
	public static function from_multi_entry( Multi_Entry $entry, Context $context ): self {
		$multi_entry = static::from_entries( $entry->entries );
		$multi_entry->set_context( $context );

		return $multi_entry;
	}

	/**
	 * Create support for individual entries to be pulled out based on context.
	 *
	 * @since 0.3.6
	 *
	 * @return \GV\Entry[]
	 */
	public function as_entry() {
		if ( empty( $this->get_context()->source->ID  ) ) {
			return [];
		}

		$source_id = $this->get_context()->source->ID;

		if ( empty( $this->entries[ $source_id ] ) ) {
			return [];
		}

		if ( ! $this->entries[ $source_id ] instanceof \GV\Entry ) {
			return [];
		}

		return $this->entries[ $source_id ]->as_entry();
	}

	/**
	 * Construct a multi entry from an array of entries.
	 *
	 * @since 0.3.6
	 *
	 * @param \GV\Entry[] $entries The entries.
	 *
	 * @return self A multi entry with context object.
	 */
	public static function from_entries( $entries ): self {
		$_entry = new self();
		foreach ( $entries as &$entry ) {
			if ( ! $entry instanceof Entry ) {
				continue;
			}
			$_entry->entries[ $entry['form_id'] ]  = &$entry;
		}
		return $_entry;
	}

}
