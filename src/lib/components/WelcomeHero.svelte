<script>
	import { showSignup, showLogin } from '../stores.js';
</script>

<div class="hero min-h-[80vh]">
	<div class="hero-content text-center">
		<div class="max-w-2xl">
			<h1 class="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
				Likey
			</h1>
			<p class="py-6 text-xl text-base-content/80">
				Share your moments, connect with friends, and discover amazing content. 
				Join the community that celebrates creativity and authentic connections.
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<button 
					class="btn btn-primary btn-lg"
					onclick={() => showSignup.set(true)}
				>
					Get Started
				</button>
				<button 
					class="btn btn-outline btn-lg"
					onclick={() => showLogin.set(true)}
				>
					Sign In
				</button>
			</div>
			
			<div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
				<div class="card bg-base-200 shadow-lg">
					<div class="card-body text-center">
						<div class="flex justify-center mb-4">
							<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
							</svg>
						</div>
						<h3 class="card-title justify-center">Share Photos</h3>
						<p class="text-sm text-base-content/70">
							Upload and share your favorite moments with beautiful, optimized images
						</p>
					</div>
				</div>
				
				<div class="card bg-base-200 shadow-lg">
					<div class="card-body text-center">
						<div class="flex justify-center mb-4">
							<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
							</svg>
						</div>
						<h3 class="card-title justify-center">Connect</h3>
						<p class="text-sm text-base-content/70">
							Follow friends, discover new creators, and build meaningful connections
						</p>
					</div>
				</div>
				
				<div class="card bg-base-200 shadow-lg">
					<div class="card-body text-center">
						<div class="flex justify-center mb-4">
							<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
							</svg>
						</div>
						<h3 class="card-title justify-center">Real-time</h3>
						<p class="text-sm text-base-content/70">
							Get instant notifications for likes, comments, and new followers
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>