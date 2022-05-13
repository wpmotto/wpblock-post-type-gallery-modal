import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import './editor.scss';
import { QueryControls, SelectControl, CheckboxControl, PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ setAttributes, attributes }) {
	const blockProps = useBlockProps();

	const [postType, setPostType] = useState(attributes.postType ?? 'post');
	const [taxonomy, setTaxonomy] = useState(attributes.taxonomy ?? '');
	const [terms, setTerms] = useState(attributes.terms ?? []);
	const [perPage, setPerPage] = useState(attributes.postsPerPage ?? 12);

	const postTypeOptions = useSelect((select) => {
		return select('core').getPostTypes({ per_page: -1 });
	}, [])?.filter(i => i.viewable).map((i) => {
		return { label: i.labels.name, value: i.slug }
	});

	const handleChangePostType = (value) => {
		setPostType(value);
		setAttributes({ postType: value });
	}

	const handleChangeTaxonomy = (value) => {
		setTaxonomy(value);
		setAttributes({ taxonomy: value });
	}

	const handleChangePerPage = (numberOfItems) => {
		setPerPage(numberOfItems);
		setAttributes({ postsPerPage: numberOfItems });
	}

	const handleAddTerm = (value, term) => {
		let selection = terms.filter(i => {
			if (i.id === term.id)
				return value;

			return true;
		});

		if (!terms.map(i => i.id).includes(term.id))
			selection = [...selection, term];

		setTerms(selection);
		setAttributes({ terms: selection });
	}

	const posts = useSelect((select) => {
		return select('core').getEntityRecords('postType', postType, {
			per_page: perPage,
			[taxonomy]: terms.map(i => i.id),
		})?.map(post => {
			if (!post.featured_media) return post;

			const thumbnail = select('core').getMedia(post.featured_media)
			return { ...post, thumbnail }
		});
	}, [postType, perPage, terms]);

	const availableTerms = useSelect((select) => {
		return select('core').getEntityRecords('taxonomy', taxonomy);
	}, [taxonomy]);

	const taxonomies = useSelect((select) => {
		const allTax = select('core').getTaxonomies({ type: postType })?.map(i => {
			return { label: i.name, value: i.slug }
		});

		if (allTax)
			return [{ label: "No taxonomy", value: null }, ...allTax];
	}, [postType]);

	return (
		<div {...blockProps}>
			<InspectorControls key="setting">
				<PanelBody title="Settings">
					<SelectControl
						label="Post Type"
						options={postTypeOptions}
						value={postType}
						onChange={handleChangePostType}
					/>
					{taxonomies?.length > 0 && <SelectControl
						label="Taxonomies"
						options={taxonomies}
						value={taxonomy}
						onChange={handleChangeTaxonomy}
					/>}

					{availableTerms && availableTerms.map(term => {
						return <CheckboxControl
							key={term.slug}
							label={term.name}
							checked={terms.filter(i => i.id === term.id).length > 0}
							onChange={(value) => handleAddTerm(value, term)}
						/>
					}
					)}

					<QueryControls
						numberOfItems={perPage}
						onNumberOfItemsChange={handleChangePerPage}
					/>
				</PanelBody>
			</InspectorControls>
			{posts && posts.length > 0 ? <div className="wp-ptgm-container">
				{posts.map(post => (
					<div key={post.id}>
						{post.thumbnail && <img className="wp-ptgm-img" src={post.thumbnail.media_details.sizes.thumbnail.source_url} alt={post.thumbnail.alt_text} />}
						<h3 className="wp-ptgm-title">{post.title.rendered}</h3>
					</div>
				))}
			</div> : <p>No records to show.</p>}

		</div>
	);
}
