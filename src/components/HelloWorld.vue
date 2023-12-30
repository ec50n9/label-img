<script setup lang="ts">
import {
  NSpace,
  NUpload,
  NButton,
  NEl,
  type UploadSettledFileInfo,
} from "naive-ui";
import { computed, onMounted, reactive, ref, watch } from "vue";

const file_list = ref<UploadSettledFileInfo[]>([]);
const handle_update_file_list = (new_file_list: UploadSettledFileInfo[]) =>
  (file_list.value = [new_file_list[new_file_list.length - 1]]);
const current_preview_img = computed(() =>
  file_list.value.length ? URL.createObjectURL(file_list.value[0].file!) : null
);

/** 画布 */
const config_konva = reactive({
  width: 200,
  height: 200,
});
/** 预览组件容器 */
const preview_container = ref<HTMLDivElement | null>(null);
onMounted(
  /** 初始化时计算画布宽高 */
  () => {
    config_konva.width = preview_container.value!.offsetWidth;
    config_konva.height = preview_container.value!.offsetHeight;
  }
);

/** 图片预览 */
const config_preview_image = reactive({
  image: new Image(),
  width: 0,
  height: 0,
});

// 文件链接变更，更新预览
const current_selected_state = reactive({
  img_width: 0,
  img_height: 0,
  img_scale: 0,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});
watch(current_preview_img, (image_url) => {
  if (!image_url) return;

  const image = new Image();
  image.onload = () => {
    // 记录图片原始大小
    current_selected_state.img_width = image.width;
    current_selected_state.img_height = image.height;

    // 默认按宽度缩放
    let scale = config_konva.width / image.width;
    // 如果高度大于宽度，按高度缩放
    if (image.height > image.width) scale = config_konva.height / image.height;

    // 计算缩放比例
    current_selected_state.img_scale = scale;

    config_preview_image.image = image;
    config_preview_image.width = image.width * scale;
    config_preview_image.height = image.height * scale;
  };
  image.src = image_url;
});

const selected_shape_name = ref("");

const config_shape1 = reactive({
  name: "shape1",
  x: 1,
  y: 1,
  width: 50,
  height: 50,
  stroke: "#6ee7b7",
  strokeWidth: 2,
  // fill: "red",
  draggable: true,
});

const transformer = ref<any>(null);
const config_transformer = reactive({
  // enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
  rotateEnabled: false,
  rotationSnaps: [0, 90, 180, 270],
  rotationSnapTolerance: 45,
  keepRatio: false,
});

const handleStageMouseDown = (e: any) => {
  if (e.target === e.target.getStage()) {
    selected_shape_name.value = "";
    updateTransformer();
    return;
  }

  const clicked_on_transformer =
    e.target.getParent().className === "Transformer";
  if (clicked_on_transformer) return;

  const name = e.target.name();
  if (name) {
    selected_shape_name.value = name;
    updateTransformer();
  }
};
const updateTransformer = () => {
  const transformer_node = transformer.value.getNode();
  const stage = transformer_node.getStage();

  const selectedNode = stage.findOne(`.${selected_shape_name.value}`);
  if (selectedNode === transformer_node.node()) return;

  if (selectedNode) {
    transformer_node.nodes([selectedNode]);
  } else {
    transformer_node.nodes([]);
  }
};

const handleDragMove = (e: any) => {
  const shape = e.target;
  const shape_position = shape.position();
  current_selected_state.x = shape_position.x / current_selected_state.img_scale;
  current_selected_state.y = shape_position.y / current_selected_state.img_scale;
};

const handleTransform = (e: any) => {
  const stage = e.target.getStage();
  const shape = stage.findOne(`.${selected_shape_name.value}`);
  const shape_position = shape.position();

  const transformer_node = transformer.value.getNode();
  const shape_rect = transformer_node.getClientRect();
  console.log(shape_rect);

  current_selected_state.x = shape_position.x / current_selected_state.img_scale;
  current_selected_state.y = shape_position.y / current_selected_state.img_scale;

  current_selected_state.width = shape_rect.width / current_selected_state.img_scale;
  current_selected_state.height = shape_rect.height / current_selected_state.img_scale;

  config_shape1.width = shape_rect.width;
  config_shape1.height = shape_rect.height;
};
</script>

<template>
  <n-el class="h-screen p-3 flex flex-col gap-3 box-border">
    <n-space class="shrink-0" align="center">
      <n-upload
        :file-list="file_list"
        @update:file-list="handle_update_file_list"
        :multiple="false"
        :show-file-list="false"
      >
        <n-button>上传图片</n-button>
      </n-upload>

      <n-space class="px-2 b-2 b-solid b-amber-5">
        <n-el
          >origin-width: {{ current_selected_state.img_width.toFixed(2) }}</n-el
        >
        <n-el
          >origin-height:
          {{ current_selected_state.img_height.toFixed(2) }}</n-el
        >
      </n-space>

      <n-space class="px-2 b-2 b-solid b-blue-5">
        <!-- <n-el>scale: {{ current_selected_state.img_scale.toFixed(2) }}</n-el> -->
        <n-el>x: {{ current_selected_state.x.toFixed(2) }}</n-el>
        <n-el>y: {{ current_selected_state.y.toFixed(2) }}</n-el>
        <n-el>width: {{ current_selected_state.width.toFixed(2) }}</n-el>
        <n-el>height: {{ current_selected_state.height.toFixed(2) }}</n-el>
      </n-space>
    </n-space>

    <div ref="preview_container" class="basis-0 grow of-hidden">
      <v-stage
        :config="config_konva"
        @mousedown="handleStageMouseDown"
        @touchstart="handleStageMouseDown"
      >
        <v-layer>
          <v-image :config="config_preview_image" />
          <v-rect
            :config="config_shape1"
            @dragmove="handleDragMove"
            @transform="handleTransform"
          />
          <v-transformer ref="transformer" :config="config_transformer" />
        </v-layer>
      </v-stage>
    </div>
  </n-el>
</template>
