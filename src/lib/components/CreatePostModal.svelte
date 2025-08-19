<script>
	import { user, showCreatePost, posts } from '../stores.js';
	import { supabase, uploadImage, compressImage, getImageUrl } from '../supabase.js';
	import { generateImagePath } from '../utils.js';
	
	// Lucide Icons
	import { Image, Plus, X } from 'lucide-svelte';
	
	let selectedImages = $state([]);
	let caption = $state('');
	let uploading = $state(false);
	let dragActive = $state(false);
	
	/**
	 * Handle file selection
	 * @param {Event} event
	 */
	function handleFileSelect(event) {
		const files = Array.from(event.target.files || []);
		addImages(files);
	}
	
	/**
	 * Handle drag and drop
	 * @param {DragEvent} event
	 */
	function handleDrop(event) {
		event.preventDefault();
		dragActive = false;
		
		const files = Array.from(event.dataTransfer.files);
		addImages(files);
	}
	
	/**
	 * Add images to the selection
	 * @param {File[]} files
	 */
	function addImages(files) {
		const imageFiles = files.filter(file => file.type.startsWith('image/'));
		
		if (imageFiles.length === 0) {
			alert('Please select only image files');
			return;
		}
		
		if (selectedImages.length + imageFiles.length > 10) {
			alert('You can only upload up to 10 images per post');
			return;
		}
		
		imageFiles.forEach(file => {
			if (file.size > 10 * 1024 * 1024) { // 10MB limit
				alert(`${file.name} is too large. Maximum file size is 10MB.`);
				return;
			}
			
			const reader = new FileReader();
			reader.onload = (e) => {
				selectedImages = [...selectedImages, {
					file,
					preview: e.target.result,
					id: Math.random().toString(36)
				}];
			};
			reader.readAsDataURL(file);
		});
	}
	
	/**
	 * Remove an image from selection
	 * @param {string} imageId
	 */
	function removeImage(imageId) {
		selectedImages = selectedImages.filter(img => img.id !== imageId);
	}
	
	/**
	 * Create the post
	 * @param {Event} event
	 */
	async function createPost(event) {
		event.preventDefault();
		
		console.log('Creating post...');
		console.log('User:', $user);
		console.log('Caption:', caption);
		console.log('Selected images:', selectedImages.length);
		
		if (!$user || (!caption.trim() && selectedImages.length === 0)) {
			console.log('Validation failed');
			return;
		}
		
		uploading = true;
		
		try {
			// Upload all images (if any)
			const imageUrls = [];
			
			if (selectedImages.length > 0) {
				for (const image of selectedImages) {
					// Compress image before upload
					const compressedFile = await compressImage(image.file);
					const imagePath = generateImagePath($user.id, image.file.name);
					
					const { data, error } = await uploadImage(compressedFile, 'images', imagePath);
					
					if (error) throw error;
					
					const publicUrl = getImageUrl('images', imagePath);
					imageUrls.push(publicUrl);
				}
			}
			
			// Create post in database
			console.log('Creating post in database...');
			console.log('Post data:', {
				user_id: $user.id,
				caption: caption.trim() || null,
				image_urls: imageUrls.length > 0 ? imageUrls : []
			});
			
			const { data: newPost, error: postError } = await supabase
				.from('posts')
				.insert({
					user_id: $user.id,
					caption: caption.trim() || null,
					image_urls: imageUrls.length > 0 ? imageUrls : []
				})
				.select(`
					*,
					profiles:user_id (
						username,
						display_name,
						profile_pic_url
					)
				`)
				.single();
			
			console.log('Database response:', { data: newPost, error: postError });
			
			if (postError) throw postError;
			
			// Add the new post to the feed
			const postWithUser = {
				...newPost,
				user: newPost.profiles,
				liked_by_user: false
			};
			
			posts.update(currentPosts => [postWithUser, ...currentPosts]);
			
			// Reset form and close modal
			selectedImages = [];
			caption = '';
			showCreatePost.set(false);
		} catch (error) {
			console.error('Error creating post:', error);
			console.error('Error details:', error.message, error.details);
			alert(`Failed to create post: ${error.message}`);
		} finally {
			uploading = false;
		}
	}
	
	/**
	 * Close modal
	 */
	function closeModal() {
		if (!uploading) {
			showCreatePost.set(false);
			selectedImages = [];
			caption = '';
		}
	}
</script>

<div class="modal modal-open">
	<div class="modal-box max-w-2xl">
		<button 
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			onclick={closeModal}
			disabled={uploading}
		>
			✕
		</button>
		
		<h3 class="font-bold text-lg mb-4">Create New Post</h3>
		
		<form onsubmit={createPost} class="space-y-4">
			<!-- Image Upload Area -->
			<div 
				role="button"
				tabindex="0"
				class="border-2 border-dashed border-base-300 rounded-lg p-8 text-center hover:border-primary transition-colors"
				class:border-primary={dragActive}
				class:bg-primary={dragActive}
				style:background-color={dragActive ? 'rgb(59 130 246 / 0.05)' : ''}
				ondragover={(e) => {
					e.preventDefault();
					dragActive = true;
				}}
				ondragleave={() => dragActive = false}
				ondrop={handleDrop}
			>
				{#if selectedImages.length === 0}
					<div class="space-y-4">
						<Image size={48} class="mx-auto text-base-content/40" />
						<div>
							<p class="text-lg font-semibold">Drag photos here</p>
							<p class="text-sm text-base-content/60">or click to select from your computer</p>
						</div>
						<input 
							type="file" 
							multiple 
							accept="image/*" 
							class="file-input file-input-bordered file-input-primary w-full max-w-xs"
							onchange={handleFileSelect}
							disabled={uploading}
						/>
					</div>
				{:else}
					<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
						{#each selectedImages as image}
							<div class="relative group">
								<img 
									src={image.preview} 
									alt="Preview" 
									class="w-full h-32 object-cover rounded-lg"
								/>
								<button 
									type="button"
									class="absolute top-2 right-2 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
									onclick={() => removeImage(image.id)}
									disabled={uploading}
								>
									<X size={12} />
								</button>
							</div>
						{/each}
						
						<!-- Add more button -->
						{#if selectedImages.length < 10}
							<label class="w-full h-32 border-2 border-dashed border-base-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
								<div class="text-center">
									<Plus size={32} class="mx-auto text-base-content/40" />
									<p class="text-xs mt-1">Add more</p>
								</div>
								<input 
									type="file" 
									multiple 
									accept="image/*" 
									class="hidden"
									onchange={handleFileSelect}
									disabled={uploading}
								/>
							</label>
						{/if}
					</div>
				{/if}
			</div>
			
			<!-- Caption -->
			<div class="form-control">
				<label class="label" for="caption">
					<span class="label-text">Caption</span>
				</label>
				<textarea 
					id="caption"
					class="textarea textarea-bordered h-24" 
					placeholder="Write a caption..."
					bind:value={caption}
					disabled={uploading}
					maxlength="2200"
				></textarea>
				<div class="label">
					<span class="label-text-alt text-base-content/60">
						{caption.length}/2200 characters
					</span>
				</div>
			</div>
			
			<!-- Submit Button -->
			<div class="modal-action">
				<button 
					type="button" 
					class="btn btn-ghost"
					onclick={closeModal}
					disabled={uploading}
				>
					Cancel
				</button>
				<button 
					type="submit" 
					class="btn btn-primary"
					class:loading={uploading}
					disabled={uploading || (!caption.trim() && selectedImages.length === 0)}
				>
					{uploading ? 'Creating Post...' : 'Share Post'}
				</button>
			</div>
		</form>
	</div>
</div>