<template>
  <div id="menubar-main">
    <el-menu
      :default-active="activeIndex2"
      :router="true"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#0069AA"
      text-color="#fff"
      active-text-color="#F58025"
      @select="handleSelect"
    >
      <el-menu-item index="1" :route="{name:'Dashboard'}">Adjustments</el-menu-item>
      <el-menu-item index="2">Admin</el-menu-item>
      <!-- <el-submenu index="2">
        <template slot="title">Admin</template>
        <el-menu-item index="2-1">item one</el-menu-item>
        <el-menu-item index="2-2">item two</el-menu-item>
        <el-menu-item index="2-3">item three</el-menu-item>
        <el-submenu index="2-4">
          <template slot="title">item four</template>
          <el-menu-item index="2-4-1">item one</el-menu-item>
          <el-menu-item index="2-4-2">item two</el-menu-item>
          <el-menu-item index="2-4-3">item three</el-menu-item>
        </el-submenu>
      </el-submenu> -->
      <el-menu-item v-if="showMassUpload === true" index="3" :route="{path:'/excel/upload-excel'}">
        Mass Upload
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      activeIndex: '1',
      activeIndex2: '1'
    }
  },
  computed: {
    ...mapGetters([
      'showMassUpload'
    ])
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>

<style scoped>
#menubar-main .el-menu {
  top: 45px;
}
#menubar-main .el-menu-item {
  font-size: 15px
}
</style>
