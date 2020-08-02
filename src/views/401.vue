<template>
  <div class="wscn-http401-container">
    <div class="wscn-http401">
      <div class="pic-401">
        <img class="pic-401__parent" src="@/assets/401_images/401.png" alt="401">
      </div>
      <div class="error">
        <div class="error__oops">OOPS!</div>
        <div class="error__headline">{{ message }}</div>
        <div class="error__info">Please check that the URL you entered is correct, or click the button below to logout.</div>
        <a href="" class="error__return-home" @click="logout">Log Out</a>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Page401',
  computed: {
    message() {
      return 'You do not have access to the application. Please contact Admin'
    }
  },
  methods: {
    logout() {
      this.$AuthService.logout()
    }
  }
}
</script>

<style lang="scss" scoped>
.wscn-http401-container{
  transform: translate(-50%,-50%);
  position: absolute;
  top: 40%;
  left: 55%;
}
.wscn-http401 {
  position: relative;
  width: 1200px;
  padding: 0 50px;
  overflow: hidden;
  .pic-401 {
    position: relative;
    float: left;
    width: 400px;
    overflow: hidden;
    &__parent {
      width: 80%;
    }
  }
  .error {
    position: relative;
    float: left;
    width: 300px;
    overflow: hidden;
    &__oops {
      font-size: 32px;
      font-weight: bold;
      line-height: 40px;
      color: #a50000;
      opacity: 0;
      margin-bottom: 20px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-fill-mode: forwards;
    }
    &__headline {
      font-size: 20px;
      line-height: 24px;
      color: #ea2402;
      font-weight: bold;
      opacity: 0;
      margin-bottom: 10px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.1s;
      animation-fill-mode: forwards;
    }
    &__info {
      font-size: 13px;
      line-height: 21px;
      color: grey;
      opacity: 0;
      margin-bottom: 30px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.2s;
      animation-fill-mode: forwards;
    }
    &__return-home {
      display: block;
      float: left;
      width: 110px;
      height: 36px;
      background: #1482f0;
      border-radius: 100px;
      text-align: center;
      color: #ffffff;
      opacity: 0;
      font-size: 14px;
      line-height: 36px;
      cursor: pointer;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.3s;
      animation-fill-mode: forwards;
    }
    @keyframes slideUp {
      0% {
        transform: translateY(60px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }
}
</style>
