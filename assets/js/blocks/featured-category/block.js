/* eslint-disable @wordpress/no-unsafe-wp-apis */

/**
 * External dependencies
 */
import { useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import {
	AlignmentToolbar,
	BlockControls,
	InnerBlocks,
	InspectorControls,
	MediaReplaceFlow,
	RichText,
	__experimentalGetSpacingClassesAndStyles as getSpacingClassesAndStyles,
	__experimentalPanelColorGradientSettings as PanelColorGradientSettings,
	__experimentalUseGradient as useGradient,
} from '@wordpress/block-editor';
import {
	Button,
	FocalPointPicker,
	PanelBody,
	Placeholder,
	RangeControl,
	Spinner,
	ToggleControl,
	ToolbarGroup,
	withSpokenMessages,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import classnames from 'classnames';
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { compose, createHigherOrderComponent } from '@wordpress/compose';
import PropTypes from 'prop-types';
import { folderStarred } from '@woocommerce/icons';
import { Icon } from '@wordpress/icons';
import ProductCategoryControl from '@woocommerce/editor-components/product-category-control';
import ErrorPlaceholder from '@woocommerce/editor-components/error-placeholder';
import TextToolbarButton from '@woocommerce/editor-components/text-toolbar-button';

/**
 * Internal dependencies
 */
import {
	dimRatioToClass,
	getCategoryImageId,
	getCategoryImageSrc,
} from './utils';
import { withCategory } from '../../hocs';
import { calculateBackgroundImagePosition } from '../featured-product/utils';
import { ConstrainedResizable } from '../featured-product/block';

/**
 * Component to handle edit mode of "Featured Category".
 *
 * @param {Object}            props                  Incoming props for the component.
 * @param {Object}            props.attributes       Incoming block attributes.
 * @param {boolean}           props.isSelected       Whether block is selected or not.
 * @param {function(any):any} props.setAttributes    Function for setting new attributes.
 * @param {string}            props.error            Error message
 * @param {function(any):any} props.getCategory      Function for getting category details.
 * @param {boolean}           props.isLoading        Whether loading or not.
 * @param {Object}            props.category         The product category object.
 * @param {function(any):any} props.debouncedSpeak   Function for delayed speak.
 * @param {function():void}   props.triggerUrlUpdate Function to update Shop now button Url.
 */
const FeaturedCategory = ( {
	attributes,
	isSelected,
	setAttributes,
	error,
	getCategory,
	isLoading,
	category,
	debouncedSpeak,
	triggerUrlUpdate = () => void null,
} ) => {
	const { setGradient } = useGradient( {
		gradientAttribute: 'overlayGradient',
		customGradientAttribute: 'overlayGradient',
	} );

	const onResize = useCallback(
		( _event, _direction, elt ) => {
			setAttributes( { minHeight: parseInt( elt.style.height, 10 ) } );
		},
		[ setAttributes ]
	);

	const renderApiError = () => (
		<ErrorPlaceholder
			className="wc-block-featured-category-error"
			error={ error }
			isLoading={ isLoading }
			onRetry={ getCategory }
		/>
	);

	const getBlockControls = () => {
		const { contentAlign, mediaSrc } = attributes;
		const mediaId = attributes.mediaId || getCategoryImageId( category );

		return (
			<BlockControls>
				<AlignmentToolbar
					value={ contentAlign }
					onChange={ ( nextAlign ) => {
						setAttributes( { contentAlign: nextAlign } );
					} }
				/>
				<ToolbarGroup>
					<MediaReplaceFlow
						mediaId={ mediaId }
						mediaURL={ mediaSrc }
						accept="image/*"
						onSelect={ ( media ) => {
							setAttributes( {
								mediaId: media.id,
								mediaSrc: media.url,
							} );
						} }
						allowedTypes={ [ 'image' ] }
					/>
					{ mediaId && mediaSrc ? (
						<TextToolbarButton
							onClick={ () =>
								setAttributes( { mediaId: 0, mediaSrc: '' } )
							}
						>
							{ __( 'Reset', 'woo-gutenberg-products-block' ) }
						</TextToolbarButton>
					) : null }
				</ToolbarGroup>
				<ToolbarGroup
					controls={ [
						{
							icon: 'edit',
							title: __(
								'Edit selected category',
								'woo-gutenberg-products-block'
							),
							onClick: () =>
								setAttributes( { editMode: ! editMode } ),
							isActive: editMode,
						},
					] }
				/>
			</BlockControls>
		);
	};

	const getInspectorControls = () => {
		const url = attributes.mediaSrc || getCategoryImageSrc( category );
		const { focalPoint = { x: 0.5, y: 0.5 } } = attributes;
		// FocalPointPicker was introduced in Gutenberg 5.0 (WordPress 5.2),
		// so we need to check if it exists before using it.
		const focalPointPickerExists = typeof FocalPointPicker === 'function';

		return (
			<InspectorControls key="inspector">
				<PanelBody
					title={ __( 'Content', 'woo-gutenberg-products-block' ) }
				>
					<ToggleControl
						label={ __(
							'Show description',
							'woo-gutenberg-products-block'
						) }
						checked={ attributes.showDesc }
						onChange={ () =>
							setAttributes( { showDesc: ! attributes.showDesc } )
						}
					/>
				</PanelBody>
				{ !! url && (
					<>
						{ focalPointPickerExists && (
							<PanelBody
								title={ __(
									'Media settings',
									'woo-gutenberg-products-block'
								) }
							>
								<ToggleGroupControl
									help={
										<>
											<p>
												{ __(
													'Choose “Cover” if you want the image to scale automatically to always fit its container.',
													'woo-gutenberg-products-block'
												) }
											</p>
											<p>
												{ __(
													'Note: by choosing “Cover” you will lose the ability to freely move the focal point precisely.',
													'woo-gutenberg-products-block'
												) }
											</p>
										</>
									}
									label={ __(
										'Image fit',
										'woo-gutenberg-products-block'
									) }
									value={ attributes.imageFit }
									onChange={ ( value ) =>
										setAttributes( {
											imageFit: value,
										} )
									}
								>
									<ToggleGroupControlOption
										label={ __(
											'None',
											'woo-gutenberg-products-block'
										) }
										value="none"
									/>
									<ToggleGroupControlOption
										/* translators: "Cover" is a verb that indicates an image covering the entire container. */
										label={ __(
											'Cover',
											'woo-gutenberg-products-block'
										) }
										value="cover"
									/>
								</ToggleGroupControl>
								<FocalPointPicker
									label={ __(
										'Focal Point Picker',
										'woo-gutenberg-products-block'
									) }
									url={ url }
									value={ focalPoint }
									onChange={ ( value ) =>
										setAttributes( {
											focalPoint: value,
										} )
									}
								/>
							</PanelBody>
						) }
						<PanelColorGradientSettings
							__experimentalHasMultipleOrigins
							__experimentalIsRenderedInSidebar
							title={ __(
								'Overlay',
								'woo-gutenberg-products-block'
							) }
							initialOpen={ true }
							settings={ [
								{
									colorValue: attributes.overlayColor,
									gradientValue: attributes.overlayGradient,
									onColorChange: ( overlayColor ) =>
										setAttributes( { overlayColor } ),
									onGradientChange: ( overlayGradient ) => {
										setGradient( overlayGradient );
										setAttributes( {
											overlayGradient,
										} );
									},
									label: __(
										'Color',
										'woo-gutenberg-products-block'
									),
								},
							] }
						>
							<RangeControl
								label={ __(
									'Opacity',
									'woo-gutenberg-products-block'
								) }
								value={ attributes.dimRatio }
								onChange={ ( dimRatio ) =>
									setAttributes( { dimRatio } )
								}
								min={ 0 }
								max={ 100 }
								step={ 10 }
								required
							/>
						</PanelColorGradientSettings>
					</>
				) }
			</InspectorControls>
		);
	};

	const renderEditMode = () => {
		const onDone = () => {
			setAttributes( { editMode: false } );
			debouncedSpeak(
				__(
					'Showing Featured Product block preview.',
					'woo-gutenberg-products-block'
				)
			);
		};

		return (
			<Placeholder
				icon={ <Icon icon={ folderStarred } /> }
				label={ __(
					'Featured Category',
					'woo-gutenberg-products-block'
				) }
				className="wc-block-featured-category"
			>
				{ __(
					'Visually highlight a product category and encourage prompt action.',
					'woo-gutenberg-products-block'
				) }
				<div className="wc-block-featured-category__selection">
					<ProductCategoryControl
						selected={ [ attributes.categoryId ] }
						onChange={ ( value = [] ) => {
							const id = value[ 0 ] ? value[ 0 ].id : 0;
							setAttributes( {
								categoryId: id,
								mediaId: 0,
								mediaSrc: '',
							} );
							triggerUrlUpdate();
						} }
						isSingle
					/>
					<Button isPrimary onClick={ onDone }>
						{ __( 'Done', 'woo-gutenberg-products-block' ) }
					</Button>
				</div>
			</Placeholder>
		);
	};

	const renderButton = () => {
		const buttonClasses = classnames(
			'wp-block-button__link',
			'is-style-fill'
		);
		const buttonStyle = {
			backgroundColor: 'vivid-green-cyan',
			borderRadius: '5px',
		};
		const wrapperStyle = {
			width: '100%',
		};
		return attributes.categoryId === 'preview' ? (
			<div className="wp-block-button aligncenter" style={ wrapperStyle }>
				<RichText.Content
					tagName="a"
					className={ buttonClasses }
					href={ category.permalink }
					title={ attributes.linkText }
					style={ buttonStyle }
					value={ attributes.linkText }
					target={ category.permalink }
				/>
			</div>
		) : (
			<InnerBlocks
				template={ [
					[
						'core/buttons',
						{
							layout: { type: 'flex', justifyContent: 'center' },
						},
						[
							[
								'core/button',
								{
									text: __(
										'Shop now',
										'woo-gutenberg-products-block'
									),
									url: category.permalink,
								},
							],
						],
					],
				] }
				templateLock="all"
			/>
		);
	};

	const renderCategory = () => {
		const {
			contentAlign,
			dimRatio,
			focalPoint,
			imageFit,
			mediaSrc,
			minHeight,
			overlayColor,
			overlayGradient,
			showDesc,
			style,
		} = attributes;

		const classes = classnames(
			'wc-block-featured-category',
			{
				'is-selected': isSelected && attributes.productId !== 'preview',
				'is-loading': ! category && isLoading,
				'is-not-found': ! category && ! isLoading,
				'has-background-dim': dimRatio !== 0,
			},
			dimRatioToClass( dimRatio ),
			contentAlign !== 'center' && `has-${ contentAlign }-content`
		);

		const containerStyle = {
			borderRadius: style?.border?.radius,
		};

		const backgroundImageSrc = mediaSrc || getCategoryImageSrc( category );

		const wrapperStyle = {
			...getSpacingClassesAndStyles( attributes ).style,
			minHeight,
		};

		const backgroundImageStyle = {
			...calculateBackgroundImagePosition( focalPoint ),
			objectFit: imageFit,
		};

		const overlayStyle = {
			background: overlayGradient,
			backgroundColor: overlayColor,
		};

		return (
			<>
				<ConstrainedResizable
					enable={ { bottom: true } }
					onResize={ onResize }
					showHandle={ isSelected }
					style={ { minHeight } }
				/>
				<div className={ classes } style={ containerStyle }>
					<div
						className="wc-block-featured-category__wrapper"
						style={ wrapperStyle }
					>
						<div
							className="wc-block-featured-category__overlay"
							style={ overlayStyle }
						/>
						{ backgroundImageSrc && (
							<img
								alt={ category.description }
								className="wc-block-featured-category__background-image"
								src={ backgroundImageSrc }
								style={ backgroundImageStyle }
							/>
						) }
						<h2
							className="wc-block-featured-category__title"
							dangerouslySetInnerHTML={ {
								__html: category.name,
							} }
						/>
						{ showDesc && (
							<div
								className="wc-block-featured-category__description"
								dangerouslySetInnerHTML={ {
									__html: category.description,
								} }
							/>
						) }
						<div className="wc-block-featured-category__link">
							{ renderButton() }
						</div>
					</div>
				</div>
			</>
		);
	};

	const renderNoCategory = () => (
		<Placeholder
			className="wc-block-featured-category"
			icon={ <Icon icon={ folderStarred } /> }
			label={ __( 'Featured Category', 'woo-gutenberg-products-block' ) }
		>
			{ isLoading ? (
				<Spinner />
			) : (
				__(
					'No product category is selected.',
					'woo-gutenberg-products-block'
				)
			) }
		</Placeholder>
	);

	const { editMode } = attributes;

	if ( error ) {
		return renderApiError();
	}

	if ( editMode ) {
		return renderEditMode();
	}

	return (
		<>
			{ getBlockControls() }
			{ getInspectorControls() }
			{ category ? renderCategory() : renderNoCategory() }
		</>
	);
};

FeaturedCategory.propTypes = {
	/**
	 * The attributes for this block.
	 */
	attributes: PropTypes.object.isRequired,
	/**
	 * Whether this block is currently active.
	 */
	isSelected: PropTypes.bool.isRequired,
	/**
	 * The register block name.
	 */
	name: PropTypes.string.isRequired,
	/**
	 * A callback to update attributes.
	 */
	setAttributes: PropTypes.func.isRequired,
	// from withCategory
	error: PropTypes.object,
	getCategory: PropTypes.func,
	isLoading: PropTypes.bool,
	category: PropTypes.shape( {
		name: PropTypes.node,
		description: PropTypes.node,
		permalink: PropTypes.string,
	} ),
	// from withSpokenMessages
	debouncedSpeak: PropTypes.func.isRequired,
	triggerUrlUpdate: PropTypes.func,
};

export default compose( [
	withCategory,
	withSpokenMessages,
	withSelect( ( select, { clientId }, { dispatch } ) => {
		const Block = select( 'core/block-editor' ).getBlock( clientId );
		const buttonBlockId = Block?.innerBlocks[ 0 ]?.clientId || '';
		const currentButtonAttributes =
			Block?.innerBlocks[ 0 ]?.attributes || {};
		const updateBlockAttributes = ( attributes ) => {
			if ( buttonBlockId ) {
				dispatch( 'core/block-editor' ).updateBlockAttributes(
					buttonBlockId,
					attributes
				);
			}
		};
		return { updateBlockAttributes, currentButtonAttributes };
	} ),
	createHigherOrderComponent( ( ProductComponent ) => {
		class WrappedComponent extends Component {
			state = {
				doUrlUpdate: false,
			};
			componentDidUpdate() {
				const {
					attributes,
					updateBlockAttributes,
					currentButtonAttributes,
					category,
				} = this.props;
				if (
					this.state.doUrlUpdate &&
					! attributes.editMode &&
					category?.permalink &&
					currentButtonAttributes?.url &&
					category.permalink !== currentButtonAttributes.url
				) {
					updateBlockAttributes( {
						...currentButtonAttributes,
						url: category.permalink,
					} );
					this.setState( { doUrlUpdate: false } );
				}
			}
			triggerUrlUpdate = () => {
				this.setState( { doUrlUpdate: true } );
			};
			render() {
				return (
					<ProductComponent
						triggerUrlUpdate={ this.triggerUrlUpdate }
						{ ...this.props }
					/>
				);
			}
		}
		return WrappedComponent;
	}, 'withUpdateButtonAttributes' ),
] )( FeaturedCategory );
