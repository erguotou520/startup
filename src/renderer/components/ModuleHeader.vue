<template>
  <div class="flex flex-jc-between flex-ai-center pb-1 mb-1">
    <div style="width:80px">
      <i-button icon="chevron-left" @click="$router.go(-1)">返回</i-button>
    </div>
    <div class="flex-1 text-center font-16">
      <slot></slot>
    </div>
    <div style="width:80px">&nbsp;</div>
  </div>
</template>
