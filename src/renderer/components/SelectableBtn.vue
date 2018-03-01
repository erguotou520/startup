<template>
  <div class="selectable-btn">
    <i-poptip v-if="scripts.length>1" trigger="click" placement="right" ref="poptip">
      <i-button :icon="icon" size="small" type="text">{{label}}</i-button>
      <div slot="content">
        <i-option v-for="script in scripts" :key="script.script"
          :disabled="script.disabled" :value="script.script"
          @click.native="clickAndClose(script.script)">{{script.script}}</i-option>
      </div>
    </i-poptip>
    <i-button v-else :icon="icon" size="small" type="text"
      @click="$emit('click', scripts[0].script)">{{label}}</i-button>
  </div>
</template>
<script>
export default {
  props: {
    icon: String,
    label: String,
    scripts: Array
  },
  computed: {
    validScripts () {
      return this.scripts.filter(script => !script.disabled)
    }
  },
  methods: {
    clickAndClose (script) {
      this.$refs.poptip.cancel()
      this.$emit('click', script)
    }
  }
}
</script>
<style lang="stylus">
.selectable-btn
  display inline-block
  .ivu-poptip-body
    padding 0
</style>
