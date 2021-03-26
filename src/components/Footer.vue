<template>
  <footer>
    <div class="legal-container">
      <div class="header">Legal</div>
      <span @click="navExt('terms-of-use')">Terms of Use</span>
      <span @click="navExt('privacy-policy')">Privacy Policy</span>
    </div>
    <div class="contact-info">
      <div class="info-column">
        <a href="tel: +1888-888-1733">1-888-888-1733</a>
        <a href="mailto: support@personabilities.com">support@personabilities.com</a>
      </div>
      <div class="info-row">
        <font-awesome-icon class="media-icon" size="lg" @click="navExtNew('fb')" :icon="['fab', 'facebook']"></font-awesome-icon>
        <font-awesome-icon class="media-icon" size="lg" @click="navExtNew('tw')" :icon="['fab', 'twitter-square']"></font-awesome-icon>
        <font-awesome-icon class="media-icon" size="lg" @click="navExtNew('li')" :icon="['fab', 'linkedin']"></font-awesome-icon>
        <font-awesome-icon class="media-icon" size="lg" @click="navExtNew('in')" :icon="['fab', 'instagram']"></font-awesome-icon>
      </div>
      <div class="info-column">
        <span>&copy; {{new Date().getFullYear()}} Personabilities, Inc. All rights reserved</span>
      </div>
      <div class="info-column">
        <span>Personabilities</span>
        <span>Vinyard, UT</span>
      </div>
    </div>
  </footer>
</template>

<script>

export default ({
  name: 'Footer',
  methods: {
    navExt(route) {
      let url = 'https://www.personabilities.com/' + route;
      window.location = url;
    },
    navExtNew(type) {
      let url = ''
      switch(type) {
        case 'fb':
          url = 'https://www.facebook.com/Personabilities-110465660703444';
          break;
        case 'tw':
          url = 'https://twitter.com/Personabilitie1';
          break;
        case 'li':
          url = 'https://www.linkedin.com/company/personabilities/';
          break;
        case 'in':
          url = 'https://www.instagram.com/personabilities/';
          break;
      }
      window.open(url, '_blank');
    }
  }
})
</script>

<style scoped>

footer {
  background: #929496;
  color: #c5c5c5;
  position: relative;
  min-height: 90px;
}

.legal-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  position: absolute;
  right: 20px;
  top: 10px;
}

.legal-container .header {
  font-size: 20px;
  margin-bottom: 5px;
}

.legal-container span {
  cursor: pointer;
  text-decoration: underline;
  margin-bottom: 3px;
}

.contact-info {
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  width: 85vw;
  text-align: center;
}

.contact-info .info-column {
  display: flex;
  flex-direction: column;
  align-content: center;
}
.contact-info .info-column a {
  color: #c5c5c5;
}
.media-icon {
  margin: 5px;
  cursor: pointer;
}
</style>