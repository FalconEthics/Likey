<a name="readme-top"></a>
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![GNU License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/FalconEthics/Likey">
    <img src="./src/assets/logo.png" alt="Logo" width="100" height="80">
  </a>

  <h3 align="center">Likey - let's chill together</h3>

  <p align="center">
    A platform to connect and hangout with your friends all over the world!
    <br />
    <a href="https://github.com/FalconEthics/Likey"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://likey-falconethics.vercel.app/">View Demo</a>
    ·
    <a href="https://github.com/FalconEthics/Likey/issues">Report Bug</a>
    ·
    <a href="https://github.com/FalconEthics/Likey/issues">Request Feature</a>
  </p>
</div>

## <a href="https://likey-falconethics.vercel.app/">Open Site</a>
Username and Password: demo



<!-- ABOUT THE PROJECT -->
## About The Project
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#progress">Progress</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

[![Product Name Screen Shot][product-screenshot]](https://github.com/FalconEthics/Likey)

My social media app will provide users with a platform to connect with their friends and family, meet new people, and share their thoughts, photos, and videos.

Users will be able to create a profile, add friends, and post updates on their feed. They can also interact with others by commenting, reacting, and messaging. In addition, the app will feature a discovery tab, where users can browse and follow content from other users, as well as a notification tab that keeps users updated on the latest activity from their friends.

My app will prioritize user privacy and security, with features such as account verification, two-factor authentication, and the ability to control who can see your posts and profile information.

Overall, my social media app aims to provide an engaging and secure platform for users to connect and share with each other.

 - Initially this project was assigned to me as frontend assesment task by a recruiter in their round 2 interview to evaluate my skills in the domain.
  - For more indepth info about my project, please refer to the frontend problem statement of RobusTest technical evaluation round 2, that was provided by the recruiter to me for evalution [Documentation](./public/assignment%20.pdf)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

Here are all the tools used in the build.

* [![Bootstrap][Bootstrap.com]][Bootstrap-url] - JS Framework
* [![JQuery][JQuery.com]][JQuery-url] - CSS Library
* [![Affinity][Affinity.com]][Affinity-url] - Axios API 
* [![Davinci][Davinci.com]][Davinci-url] - UI/UX
* [![Git][Git.com]][Git-url] - Deployment

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Our social media app can be used in a variety of ways, including:

Staying connected with friends and family: Users can use the app to keep in touch with their loved ones by sending messages, commenting on each other's posts, and reacting to content.

Meeting new people: The app's discovery tab and messaging feature allow users to connect with others who share similar interests, backgrounds, or locations.

Sharing content: Users can share photos, videos, and thoughts on their feed for their friends and followers to see.

Staying up to date: The notification tab keeps users informed about the latest activity from their friends, so they never miss an update.

Privacy and security: Our app includes features such as account verification, two-factor authentication, and the ability to control who can see your posts and profile information, ensuring that users feel safe and secure while using the app.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- Progress -->
## Progress

These are the features available and functional on the site with respect to the problem statement provided to me: [Documentation](./public/assignment%20.pdf)

- The platform displays
  - the posts
  - comments related to the post
- Following are the detailed specifications according to which the system has
been built
  - The user are able to
    - Create a new POST
    - update any existing POST (allowed for
the user who owns the post)
    - Delete the post (allowed for the user who
owns the post)
  - For each post, the user is be able to see the
comments on it.
  - Commenting is only allowed by registered users - *Dummy api doesn't actually process "POST" request, writing an axios post req. would not through an error but also won't perform anything so impleminting real authenticaion is not possible without a real API*
  - The UI is designed in such a way that it has a
similar user experience when seen on mobile devices and
bigger device screens.
    - The design stays same for all mobile
devices. It does not change with respect to the
device.
    - UI progression for all screen and sizes.
  - UI for new user account creation.
  - UI for account login.

<!-- ROADMAP -->
## Roadmap

Here is a rough roadmap for intrested contributors that i will be following in near future for my social media app project:

Integrate with a backend service: In order to store user data and handle server-side logic, I will need to integrate my app with a backend service such as Firebase or a custom backend server.

Implement user authentication: Allow users to create accounts and log in to the app using their email and password. I may also want to consider implementing social login options such as Facebook or Google.

Implement feed functionality: Allow users to post updates to their feed and view updates from their friends. This will likely require integrating with a database to store and retrieve feed data.

Implement messaging functionality: Allow users to send and receive private messages with each other. This will also require integrating with a database to store and retrieve message data.

Implement notification functionality: Allow users to receive notifications when their friends interact with them on the app, such as commenting on their posts or messaging them.

Test and debug: Thoroughly test the app to ensure that it is functioning correctly and fix any issues that are discovered.

Launch the app: Once I have completed the above steps and my app is functioning as intended, I will launch it on the app store or make it available for download on my website.

Note: This roadmap is a general suggestion and may not cover all the specific tasks and considerations that are relevant to my project. It's important to create a more detailed plan that takes into account the specific needs and requirements of my app that i will publish when i start commiting my time on this project more seriously.

- [x] Base structure
- [x] Twitter inspired frontend UI
- [x] Implement Vue.js Framework
- [x] Replace Vannila css and Bootstrap with Tailwind CSS
- [ ] Build the Backend
    - [ ] API intergration
    - [ ] Proper Deployment with payment gateway and user database

See the [open issues](https://github.com/FalconEthics/Likey/issuess) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

- to run & setup the project in your local env. for development
1. Fork the Project
 ```sh
cd Likey
```
2. Install all it's dependencies
 ```sh
npm install
```
3. Preview site with vite
 ```sh
npm run dev
```
- to contribute your code
1. Create your Feature Branch 
 ```sh
git checkout -b feature/AmazingFeature
```
2. Commit your Changes 
```s
git commit -m Add some AmazingFeature
```
3. Push to the Branch 
```s
git push origin feature/AmazingFeature
```
4. Open a Pull Request
- Your code will be merged to the main branch as soon as I review your code ~

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the GNU License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Soumik Das - [Twitter](https://twitter.com/SoumikD95642409) / [Porfolio Site](https://www.soumik-das.com/) / [Linkedlin](https://www.linkedin.com/in/soumik-das-profile/)

Project Link: [https://github.com/FalconEthics/Likey](https://github.com/FalconEthics/Likey)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Acknowledgments

 -Initially this project was assigned to me as frontend assesment task by RobusTest in their round 2 interview to evaluate my skills in the domain.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/FalconEthics/Likey.svg?style=for-the-badge
[contributors-url]: https://github.com/FalconEthics/Likey/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/FalconEthics/Likey.svg?style=for-the-badge
[forks-url]: https://github.com/FalconEthics/Likey/network/members
[stars-shield]: https://img.shields.io/github/stars/FalconEthics/Likey.svg?style=for-the-badge
[stars-url]: https://github.com/FalconEthics/Likey/stargazers
[issues-shield]: https://img.shields.io/github/issues/FalconEthics/Likey.svg?style=for-the-badge

[issues-url]: https://github.com/FalconEthics/Likey/issues
[license-shield]: https://img.shields.io/github/license/FalconEthics/Likey.svg?style=for-the-badge

[license-url]: https://github.com/FalconEthics/Likey/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555

[linkedin-url]: https://www.linkedin.com/in/soumik-das-profile/

[product-screenshot]: ./public/screenshot.png
<!-- [product-screenshot2]: https://raw.githubusercontent.com/FalconEthics/Likey/main/Trinetro_Drone_2022-Sep-03_04-16-58AM-000_CustomizedView13304029920.png
[product-screenshot3]: https://raw.githubusercontent.com/FalconEthics/Likey/main/Trinetro_Drone_2022-Sep-03_04-18-29AM-000_CustomizedView9151492485.png
[product-screenshot4]: https://raw.githubusercontent.com/FalconEthics/Likey/main/Trinetro_Drone_2022-Sep-03_04-22-00AM-000_CustomizedView12173695879.png
[product-components]: https://raw.githubusercontent.com/FalconEthics/Likey/main/Components.png -->


[Bootstrap.com]: https://img.shields.io/badge/Vue_3-43D393?style=for-the-badge&logo=vue.js&logoColor=white
[Bootstrap-url]: https://vuejs.org/
[JQuery.com]: https://img.shields.io/badge/Tailwind-0769AD?style=for-the-badge&logo=tailwindcss&logoColor=white
[JQuery-url]: https://tailwindcss.com/
[Es6.com]: https://img.shields.io/badge/ECMAScript6-7BDCB5?style=for-the-badge&logo=vue.js&logoColor=white
[Es6-url]: https://es6.io/
[Html.com]: https://img.shields.io/badge/HTML5-8ED1FC?style=for-the-badge&logo=H&logoColor=white
[Html-url]: https://html.com/html5/
[Css.com]: https://img.shields.io/badge/Custom_CSS-8ED1FC?style=for-the-badge&logo=C&logoColor=white
[Css-url]: http://css.com/
[Affinity.com]: https://img.shields.io/badge/Jsonplaceholder-FFFF00?style=for-the-badge&logo=json&logoColor=white
[Affinity-url]: https://jsonplaceholder.typicode.com/
[Davinci.com]: https://img.shields.io/badge/Figma-9900EF?style=for-the-badge&logo=figma&logoColor=white
[Davinci-url]: https://www.figma.com/
[Git.com]: https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white
[Git-url]: https://vercel.com/
