/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { Icon, server } from '@woocommerce/icons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import edit from './edit.js';

registerBlockType( 'woocommerce/color-attribute-filter', {
	title: __(
		'Filter Products by Color Attribute',
		'woo-gutenberg-products-block'
	),
	icon: {
		src: <Icon srcElement={ server } />,
		foreground: '#96588a',
	},
	category: 'woocommerce',
	keywords: [ __( 'WooCommerce', 'woo-gutenberg-products-block' ) ],
	description: __(
		'Allow customers to filter the grid by product attribute, such as color. Works in combination with the All Products block.',
		'woo-gutenberg-products-block'
	),
	supports: {
		html: false,
	},
	example: {
		attributes: {
			isPreview: true,
		},
	},
	attributes: {
		attributeId: {
			type: 'number',
			default: 0,
		},
		showCounts: {
			type: 'boolean',
			default: true,
		},
		queryType: {
			type: 'string',
			default: 'or',
		},
		heading: {
			type: 'string',
			default: __(
				'Filter by color attribute',
				'woo-gutenberg-products-block'
			),
		},
		headingLevel: {
			type: 'number',
			default: 3,
		},
		showFilterButton: {
			type: 'boolean',
			default: false,
		},
		/**
		 * Are we previewing?
		 */
		isPreview: {
			type: 'boolean',
			default: false,
		},
	},
	edit,
	// Save the props to post content.
	save( { attributes } ) {
		const {
			className,
			showCounts,
			queryType,
			attributeId,
			heading,
			headingLevel,
			showFilterButton,
		} = attributes;
		const data = {
			'data-attribute-id': attributeId,
			'data-show-counts': showCounts,
			'data-query-type': queryType,
			'data-heading': heading,
			'data-heading-level': headingLevel,
		};
		if ( showFilterButton ) {
			data[ 'data-show-filter-button' ] = showFilterButton;
		}
		return (
			<div
				className={ classNames( 'is-loading', className ) }
				{ ...data }
			>
				<span
					aria-hidden
					className="wc-block-product-color-attribute-filter__placeholder"
				/>
			</div>
		);
	},
} );