<template>
  <div class="m-settings">
    <i-tabs style="overflow:initial">
      <i-tab-pane label="通用设置">
        <i-form class="px-1" :model="form" inline :label-width="80">
          <i-form-item prop="autoLaunch" label="开机自启动">
            <i-checkbox v-model="form.autoLaunch" @on-change="update('autoLaunch')"></i-checkbox>
            <a class="ml-2" href @click.prevent="autoLaunch.modal=true">点击配置开机启动项目</a>
            <a class="ml-2" href @click.prevent="launchScript.modal=true">
              点击配置开机启动脚本&nbsp;
              <i-tooltip placement="right">
                <i-icon type="help-circled"></i-icon>
                <div slot="content">在开机后将按顺序执行下面的脚本</br>
                适用于打开应用、启动IDE等</br>
                不要加入无法结束的命令</div>
              </i-tooltip>
            </a>
          </i-form-item>
          <i-row :gutter="24">
            <i-col :span="12">
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
    <i-modal v-model="launchScript.modal" title="开机启动脚本管理"
      width="640px" @on-ok="saveAutoLaunchScript">
      <i-form :model="launchScript.form" ref="launchScript">
        <div v-for="(script, scriptIndex) in launchScript.form.scripts" :key="scriptIndex" class="flex">
          <i-form-item class="flex-1" :prop="`scripts.${scriptIndex}`"
            :rules="[{required:true, message: '执行脚本必填'}, {validator:(rule,value,cb) => getScriptRule(scriptIndex, value, cb)}]">
            <i-input :value="script" @input="v=>launchScript.form.scripts[scriptIndex]=v"
              placeholder="请输入开机后要执行的脚本指令"></i-input>
          </i-form-item>
          <i-button-group class="ml-2">
            <i-button :disabled="launchScript.form.scripts.length<2" icon="minus"
              @click="launchScript.form.scripts.splice(scriptIndex,1)"></i-button>
            <i-button :disabled="scriptIndex===0" icon="arrow-up-c"
              @click="upScript(scriptIndex)"></i-button>
            <i-button :disabled="scriptIndex===launchScript.form.scripts.length - 1" icon="arrow-down-c"
              @click="downScript(scriptIndex)"></i-button>
          </i-button-group>
        </div>
        <i-form-item>
          <i-button type="info" icon="plus" @click="addScript">继续添加</i-button>
        </i-form-item>
      </i-form>
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
      },
      launchScript: {
        modal: false,
        form: {
          scripts: appConfig.autoLaunchScripts && appConfig.autoLaunchScripts.length ? appConfig.autoLaunchScripts : ['']
        }
      }
    }
  },
  computed: {
    ...mapGetters(['projects'])
  },
  methods: {
    ...mapActions(['updateConfig']),
    // 动态生成脚本的唯一性验证规则
    getScriptRule (scriptIndex, value, cb) {
      const clone = this.launchScript.form.scripts.slice()
      // 排除自身
      clone.splice(scriptIndex, 1)
      // 有重复script
      if (clone.indexOf(value) > -1) {
        cb(new Error('不允许重复脚本'))
      } else {
        cb()
      }
    },
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
    addScript () {
      this.$refs.launchScript.validate(valid => {
        if (valid) {
          this.launchScript.form.scripts.push('')
        }
      })
    },
    upScript (index) {
      const item = this.launchScript.form.scripts.splice(index, 1)
      this.launchScript.form.scripts.splice(index - 1, 0, item[0])
    },
    downScript (index) {
      const item = this.launchScript.form.scripts.splice(index, 1)
      this.launchScript.form.scripts.splice(index + 1, 0, item[0])
    },
    saveAutoLaunchScript () {
      this.$refs.launchScript.validate(valid => {
        if (valid) {
          this.updateConfig({ autoLaunchScripts: this.launchScript.form.scripts.slice() })
        }
      })
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
