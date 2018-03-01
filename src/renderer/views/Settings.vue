<template>
  <div class="m-settings">
    <i-tabs style="overflow:initial">
      <i-tab-pane label="通用设置">
        <i-form class="px-1" :model="form" inline :label-width="80">
          <i-row :gutter="24">
            <i-col :span="12">
              <i-form-item prop="autoLaunch" label="开机自启动">
                <i-checkbox v-model="form.autoLaunch" @on-change="update('autoLaunch')"></i-checkbox>
                <a class="ml-2" href @click.prevent="autoLaunch.modal=true">点击配置开机启动项目</a>
              </i-form-item>
              <i-form-item prop="defaultIDE" label="默认IDE工具" style="width:100%">
                <i-select v-model="form.defaultIDE" @on-change="update('defaultIDE')">
                  <i-option v-for="ide in ides" :key="ide.value" :value="ide.value">{{ide.label}}</i-option>
                </i-select>
              </i-form-item>
            </i-col>
          </i-row>
        </i-form>
      </i-tab-pane>
    </i-tabs>
    <i-modal v-model="autoLaunch.modal" title="开机启动项目管理"
      width="640px" @on-ok="saveAutoLaunchProject">
      <i-table border height="240" @on-selection-change="onAutoLaunchSelectionChange"
        :columns="autoLaunch.columns"
        :data="projects" ref="autoTable"></i-table>
    </i-modal>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { debounce, clone } from '../../shared/utils'
import defaultConfig from '../../shared/config'
export default {
  data () {
    const appConfig = this.$store.getters.appConfig
    const scripts = {}
    appConfig.projects.forEach(project => {
      scripts[project.path] = project.scripts
    })
    return {
      form: {
        autoLaunch: appConfig.autoLaunch || defaultConfig.autoLaunch,
        defaultIDE: appConfig.defaultIDE || defaultConfig.defaultIDE
      },
      ides: [
        { label: 'Visual Studio Code', value: 'vscode' },
        { label: 'Atom', value: 'atom' }
      ],
      autoLaunch: {
        modal: false,
        columns: [
          { type: 'selection', width: 50, align: 'center' },
          { title: '项目名称', key: 'name', width: 140, ellipsis: true },
          { title: '项目目录', key: 'path', ellipsis: true },
          { title: '执行脚本', key: 'scripts', render: (h, { row, index }) => {
            const _this = this
            return h('i-select', {
              props: {
                value: row.autoLaunch ? row.autoLaunchScripts : row.scripts,
                multiple: true
              },
              on: {
                input (v) {
                  _this.autoLaunch.scripts[row.path] = v
                }
              }
            }, _this.projects[index].scripts.map(script => {
              return h('i-option', {
                props: {
                  value: script
                }
              }, script)
            }))
          } }
        ],
        projects: appConfig.projects.filter(project => project.autoLaunch),
        scripts
      }
    }
  },
  computed: {
    ...mapGetters(['projects'])
  },
  methods: {
    ...mapActions(['updateConfig']),
    onAutoLaunchSelectionChange (selection) {
      this.autoLaunch.projects = selection
    },
    saveAutoLaunchProject () {
      const data = this.projects.map(project => {
        const clonedProject = clone(project)
        clonedProject.autoLaunch = this.autoLaunch.projects.findIndex(p => p.path === project.path) > -1
        clonedProject.autoLaunchScripts = clonedProject.autoLaunch ? this.autoLaunch.scripts[project.path] : []
        return clonedProject
      })
      this.updateConfig({ projects: data })
    },
    update: debounce(function (field) {
      if (this.form[field] !== this.$store.getters.appConfig[field]) {
        this.updateConfig({ [field]: this.form[field] })
      }
    }, 1000)
  },
  mounted () {
    this.$nextTick(() => {
      this.autoLaunch.projects.forEach(project => {
        this.$refs.autoTable.toggleSelect(this.projects.indexOf(project))
      })
    })
  }
}
</script>
