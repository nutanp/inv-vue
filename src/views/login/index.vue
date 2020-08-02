<template>
  <div class="login-container">
    <el-form class="login-form" auto-complete="on" label-position="left">
      <div class="title-container">
        <h3 class="title">Inventory Adjustments Login</h3>
      </div>
      <el-button type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="login">Login</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  methods: {
    login() {
      this.$AuthService.loginRedirect()
    }
  }
}
</script>

<style lang="scss">
$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }
}
</style>
