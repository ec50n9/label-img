<script lang="ts" setup>
import { App, Rect, Image, ImageEvent } from "leafer-ui";
import {
  EditorEvent,
  EditorMoveEvent,
  EditorScaleEvent,
} from "@leafer-in/editor";
// import "@leafer-in/editor";
import { computed, onMounted, reactive, ref, watch } from "vue";
import {
  NUpload,
  NButton,
  type UploadSettledFileInfo,
useMessage,
} from "naive-ui";
import vue_svg from "../assets/vue.svg";
import { calc_scale, file2base64, copy_text } from "../utils";

const message = useMessage();

const copy_text_and_show = (text: string) => {
  copy_text(text);
  message.info(`已复制 ${text}`);
};

// 文件上传相关
const file_list = ref<UploadSettledFileInfo[]>([]);
const handle_update_file_list = (new_file_list: UploadSettledFileInfo[]) =>
  (file_list.value = [new_file_list[new_file_list.length - 1]]);
const current_preview_img = computed(() =>
  file_list.value.length ? file_list.value[0].file! : null
);

// app 实例
let app: App | null = null;

const image_info = reactive({
  width: 0,
  height: 0,
  scale: 1,
});

// 预览图片
const image = Image.one({ url: vue_svg, draggable: false }, 0, 0);
image.on(ImageEvent.LOADED, (e: ImageEvent) => {
  const img = e.image;
  const scale = calc_scale(
    img.width,
    img.height,
    app?.width ?? 0,
    app?.height ?? 0
  );

  image_info.width = img.width;
  image_info.height = img.height;
  image_info.scale = scale;

  image.set({ width: img.width * scale, height: img.height * scale });
});
// 选择文件后更新预览图片
watch(current_preview_img, async (image_file) => {
  const image_url = image_file ? await file2base64(image_file) : undefined;
  image.set({ url: image_url });
});

// 选框状态
const selector_state = reactive({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});
const size_text = computed(
  () => `${image_info.width.toFixed(2)}x${image_info.height.toFixed(2)}`
);
const scope_text = computed(
  () =>
    `(${selector_state.x.toFixed(2)},${selector_state.y.toFixed(
      2
    )}, ${selector_state.width.toFixed(2)}, ${(
      selector_state.x + selector_state.width
    ).toFixed(2)}, ${(selector_state.y + selector_state.height).toFixed(2)})`
);

// 选框元素
const selector = Rect.one(
  {
    editable: true,
    stroke: "#feb027",
    strokeAlign: "outside",
    strokeWidth: 2,
    fill: {
      type: "solid",
      color: "#feb02711",
    },
    cornerRadius: 4,
  },
  100,
  100
);

onMounted(() => {
  app = new App({
    view: "leafer-app",
    editor: {},
  });

  app.tree.add(image);
  app.tree.add(selector);

  app.editor.on(
    [EditorMoveEvent.MOVE, EditorScaleEvent.SCALE],
    (e: EditorEvent) => {
      const selector = e.target;
      selector_state.x = (selector.x ?? 0) / image_info.scale;
      selector_state.y = (selector.y ?? 0) / image_info.scale;
      selector_state.width = (selector.width ?? 0) / image_info.scale;
      selector_state.height = (selector.height ?? 0) / image_info.scale;
    }
  );
});
</script>

<template>
  <div class="w-screen h-screen flex flex-col">
    <div class="shrink-0 p-3 flex flex-wrap items-center gap-3">
      <div>
        <n-upload
          :file-list="file_list"
          @update:file-list="handle_update_file_list"
          :multiple="false"
          :show-file-list="false"
        >
          <n-button>上传图片</n-button>
        </n-upload>
      </div>

      <div @click="copy_text_and_show(size_text)">
        size:
        <span class="c-amber-7">{{ size_text }}</span>
      </div>

      <div @click="copy_text_and_show(scope_text)">
        sel:
        <span class="c-emerald-7">{{ scope_text }}</span>
      </div>
    </div>

    <div class="basis-0 grow p-3 pt-0">
      <div id="leafer-app" class="h-full"></div>
    </div>
  </div>
</template>
