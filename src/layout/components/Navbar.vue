<template>
  <div class="navbar">
    <div id="header">
      <div id="left-menu">
        <img src="../../assets/images/something_Logo.png" alt="something Logo">
        <h1>Inventory Adjustment</h1>
      </div>
      <div class="right-menu">
        <el-dropdown class="avatar-container" trigger="click">
          <div class="avatar-wrapper">
            <img src="../../assets/images/user.png" class="user-avatar">
            <span class="user-name">{{ this.loggedInUserFullName }}</span>
            <i class="el-icon-caret-bottom" />
          </div>
          <el-dropdown-menu slot="dropdown" class="user-dropdown">
            <router-link to="/">
              <el-dropdown-item>Home</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided>
              <span style="display:block;" @click="logout">Log Out</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div id="menu-bar">
      <Menubar />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Menubar from './Menubar.vue'

export default {
  components: {
    Menubar
  },
  computed: {
    ...mapGetters(['avatar', 'loggedInUserFullName'])
  },
  methods: {
    logout() {
      this.$store.dispatch('inventory/resetFilteredAdjustments')
      this.$store.dispatch('inventory/resetChosen')
      this.$AuthService.logout()
    }
  }
}
</script>

<style lang="scss" scoped>

.el-dropdown-menu {
  top: 40px !important;
}

.navbar {
  height: 125px;
  overflow: hidden;
  position: relative;
  background-color: white; //linear-gradient(to right, white, #005a8c);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  #header {
    #left-menu {
      display: inline-block;
      img {
        width: 175px;
        position: absolute;
        top: 6%;
        left: 0px;
        padding-left: 10px;
      }
      h1 {
        color: #EF8200;
        display: inline-block;
        position: absolute;
        top: -12px;
        left: 190px;
      }
    }
    .right-menu {
      float: right;
      height: 100%;
      line-height: 50px;

      &:focus {
        outline: none;
      }

      .right-menu-item {
        display: inline-block;
        padding: 0 8px;
        height: 100%;
        font-size: 18px;
        color: #5a5e66;
        vertical-align: text-bottom;

        &.hover-effect {
          cursor: pointer;
          transition: background 0.3s;

          &:hover {
            background: rgba(0, 0, 0, 0.025);
          }
        }
      }

      .avatar-container {
        margin-right: 50px;

        .avatar-wrapper {
          margin-top: 10px;
          position: relative;

          .user-avatar {
            cursor: pointer;
            width: 35px;
            border-radius: 50%;
            margin-top: 15px;
          }

          .user-name {
            position: relative;
            top: -10px;
          }

          .el-icon-caret-bottom {
            cursor: pointer;
            position: absolute;
            right: -20px;
            top: 25px;
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
