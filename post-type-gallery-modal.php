<?php

/**
 * Plugin Name:       Post Type Gallery Modal
 * Description:       Example static block scaffolded with Create Block tool.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       post-type-gallery-modal
 *
 * @package           create-block
 */

function ptgm_dynamic_render_callback($block_attributes)
{
	$query = array(
		'post_type' => $block_attributes['postType'],
		'posts_per_page' => $block_attributes['postsPerPage'] ?? 12,
	);
	if (!empty($block_attributes['terms'])) {
		$query['tax_query'] = array(
			array(
				'taxonomy' => $block_attributes['taxonomy'],
				'field' => 'id',
				'terms' => array_map(fn ($term) => $term['id'], $block_attributes['terms']),
			),
		);
	}

	$posts = get_posts($query);
	$block_id = uniqid();
	$size = $block_attributes['thumbnailSize'];

	$posts_array = array_map(function ($post) use ($block_id, $size) {
		$title = get_the_title($post);
		$thumbnail = get_the_post_thumbnail($post->ID, $size, array('alt' => $title, 'class' => 'wp-ptgm-img'));
		$featured_src = get_the_post_thumbnail_url($post->ID, 'large');

		return sprintf(
			'<a href="%3$s" class="wp-ptgm-item" data-glightbox="title: %2$s; description: .wp-ptgm-modal-%6$s" data-gallery="gallery-%5$s">
				%1$s
				<h3 class="wp-ptgm-title">%2$s</h3>
			</a>
			<template class="wp-ptgm-modal-%6$s">
				<div class="wp-ptgm-modal-content">%4$s</div>
			</template>
			',
			$thumbnail,
			esc_html($title),
			$featured_src,
			apply_filters('the_content', $post->post_content),
			$block_id,
			$post->ID,
		);
	}, $posts);

	$posts_html = implode(PHP_EOL, $posts_array);
	$classes = '';
	if ($align = $block_attributes['align'])
		$classes .= " align$align";

	return <<<HTML
		<div class="wp-block-create-block-post-type-gallery-modal{$classes}">
			<div class="wp-ptgm-container">
				$posts_html
			</div>
		</div>
	HTML;
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_ptgm_block_init()
{
	// automatically load dependencies and version
	$asset_file = include(plugin_dir_path(__FILE__) . 'build/index.asset.php');

	wp_register_script(
		'post-type-gallery-modal-block',
		plugins_url('build/index.js', __FILE__),
		$asset_file['dependencies'],
		$asset_file['version']
	);

	register_block_type(__DIR__ . '/build', array(
		'api_version' => 2,
		'editor_script' => 'post-type-gallery-modal-block',
		'render_callback' => 'ptgm_dynamic_render_callback'
	));
}
add_action('init', 'create_block_ptgm_block_init');
