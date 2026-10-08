# 一期优惠券中心后台原型 · Prototype Index

> 执行范围：后台管理端；运行方式：打开 `index.html`；数据：本地 mock，可重置。

| Task ID | 功能模块 | 页面/场景 | Page Type | Page Key | Route | Surface | Parent | 关键交互 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| T001 | 活动管理中心 | 储值活动 / 其他活动 | List | activity-list | `#activities` / `#activity-other` | page | - | 活动管理中心下以储值活动为当前列表入口，取消列表页内的双 Tab 分级；储值活动和其他活动均按同一套列表结构展示，其他活动展示非 `recharge` 模拟数据并提供活动类型、触发方式筛选；储值活动表头为序号、活动名称、充值金额、状态、开始时间、结束时间、关联优惠券、操作，其他活动新增触发方式列并将原第三列替换为活动类型，关联列改为关联优惠券/CDK；储值活动和其他活动均提供“活动时限”筛选，枚举为“长期/限时”，开始时间与结束时间均为“长期”时归为长期，否则归为限时；储值活动列表的充值金额展示首个充值梯度金额，多梯度规则以活动详情为准；不限时活动的开始时间和结束时间均显示为“长期”；提供多条不同状态的模拟活动数据；【新建储值活动】与【其他活动】页的【新建活动】均以同款弹窗打开，复用活动表单字段和保存、发布逻辑；支持搜索、状态筛选、分页、详情、复制并新建、停用后启用、删除；编辑入口保留在详情页和详情弹窗；复制并新建会打开新建储值活动弹窗并回填全部字段，活动名称追加“（副本）” | Completed |
| T026 | 活动管理中心 | CDK管理 | List/Create/Detail Modal | cdk-management | `#cdk-management` | page/modal | - | 复用活动列表的卡片、工具栏、搜索、状态筛选、表格、分页和详情弹窗结构，展示 CDK 批次、关联优惠券、关联活动、码模式、批次编号、核销进度、状态和创建时间；状态仅为进行中、已暂停、已结束、已终止、已过期；创建批次后直接进入进行中；运行中的批次可暂停或终止，暂停的批次可恢复；核销进度使用百分比进度条；操作提供导出码列表、暂停/恢复发放、终止批次；新建 CDK 批次使用弹窗，包含批次名称、批次类别、码模式（共享码/唯一码）、共享码模式下可填写指定码、总可核销次数、生效开始日期与生效截止日期（同一行展示）和可追加多条关联券 | Completed |
| T002 | 活动管理中心 | 新建/编辑活动 | Create/Edit | activity-form | `#activity-form` | modal | - | 储值活动新建/编辑包含活动名称、规则信息（触发方式含充值送券、自动发放、主动领取、手动发放、CDK兑换；储值活动固定选择充值送券，其他方式置灰；活动时间下的长期滑动按钮、开始日期与结束日期选框及中间分隔符、目标资格）、发放内容下的“充值梯度”小分级；每个充值梯度包含充值金额和可重复添加的多条关联优惠券，每条关联券独立配置发放数量，支持新增与删除梯度及梯度内关联券；活动说明、表单校验、直接发布；其他活动新建复用同款弹窗结构，但标题为“新建活动”，活动类型可选，触发方式可选自动发放、主动领取、手动发放、CDK兑换，充值送券后置并置灰，发放内容不展示充值金额；选择 CDK兑换时，发放内容中的“关联优惠券”切换为“关联CDK批次”，并同步更新右侧预览；新建和编辑均在同一弹窗中完成，编辑从只读详情弹窗切换为可编辑表单；新建活动默认开启长期，一个长期开关同时控制开始与结束日期框，开启后两个日期框置灰，限制领取开启后才展示限领次数并提供加减控件，优惠券关联通过发放内容维护 | Completed |
| T003 | 活动管理中心 | 活动详情 | Detail Modal | activity-detail | `#activities`（详情弹窗） | modal | - | 储值活动详情按储值活动规则展示，并在发放内容下以只读方式展示“充值梯度”及每个梯度的充值金额、多条关联优惠券和各自发放数量；其他活动详情按新建活动规则展示实际活动类型与触发方式，触发方式顺序为自动发放、主动领取、手动发放、CDK兑换、充值送券（充值送券置灰），不展示充值金额；CDK触发时将关联优惠券切换为关联CDK批次；活动时间、目标资格、关联内容、限制领取保持只读，详情弹窗提供编辑入口及关闭操作 | Completed |
| T004 | 优惠券中心 ＞ 优惠券管理 | 券模板列表 | List | coupon-template-list | `#templates` | page | - | 优惠券管理三级 Tab 下的券模板页；表头名称和顺序与优惠券列表一致；名称下不显示来源/适用范围副标题；按名称或编号搜索、新建券模板弹窗、编辑、由模板新增 | Completed |
| T005 | 优惠券中心 ＞ 优惠券管理 | 新建/编辑券模板 | Create/Edit Modal | coupon-template-form | `#templates` | modal | coupon-template-list | 从券模板三级页签列表打开，配置可复用规则；预设、三维字段、高级设置、校验、保存 | Completed |
| T007 | 数据与记录 | 优惠券看板 | Dashboard | coupon-dashboard | `#dashboard` | page | - | 面向运营日常监控；时间筛选为昨天、今天、近7天、近30天，另按活动、实际优惠券配置/批次、发放来源筛选，三个业务维度按关联关系联动；顶部四项核心指标为实际到账券数、核销次数、核销率、实际优惠金额；红框趋势图在原有图表内增加实际到账券数、核销次数、核销率三个统计系列，不新增独立统计表；下方展示实际到账券实例趋势、来源分布和活动明细，近30天按周汇总，单日按日汇总；显示数据更新时间并支持刷新；不提供异常提醒及异常记录下钻；指标卡、趋势点和来源项可下钻至现有记录页并自动携带筛选条件；不展示成交额、主动领取成功量、券均核销次数及额外口径提示框 | Completed |
| T008 | 数据与记录 | 发放与核销记录 | List/Tabs | coupon-records | `#records` | page | - | 发放记录、领取记录、核销流水三个事件页签；完整记录字段、活动/优惠券/来源级联筛选、时间快捷与自定义范围和详情；异常与补偿入口已移除 | Completed |
| T009 | 数据与记录 | 记录详情 | Modal/Scenario | record-detail | `#records?detail` | modal | records | 展示记录关联信息、结果信息和状态时间线；仅用于查询，不提供异常处置操作 | Completed |
| T010 | 共享能力 | 布局、路由、mock 状态 | Runtime | coupon-admin-runtime | all routes | runtime | - | hash 路由、Toast、弹窗、状态重置 | Completed |
| T011 | 优惠券中心 | 优惠券配置/批次列表 | List | coupon-list | `#coupon-form` | page | - | 搜索框提示“搜索配置名称”（搜索匹配逻辑不变），可按来源/模板筛选；配置不区分状态、不显示状态列或状态筛选；所有配置均可删除并二次确认；打开新增、查看详情和关联流水；列表不展示“优惠券描述”“使用方式”“最低消费”“有效期”及名称下方重复的“配置/批次”小字；表头顺序为序号、优惠券名称、创建/更新时间、优惠券类型、优惠金额、最大折扣金额、已发放数量、未核销券数、操作；各列按固定比例分配宽度，避免列间留白不均 | Completed |
| T012 | 优惠券中心 | 新增/编辑优惠券配置 | Create/Edit | coupon-create-form | `#coupon-create-form` | page | coupon-list | 先选券类型；可在类型区域选择可复用券模板，也可不选模板直接配置；再填写基础信息和动态高级设置；最后关联多个活动；确认后直接发布并生效，不提供草稿保存 | Completed |
| T014 | 优惠券中心 | 优惠券配置详情 | Detail | coupon-detail | `#coupon-detail` | page | coupon-list | 查看配置规则、关联活动、进入记录、执行人工发券 | Completed |
| T039 | 数据与记录 | 优惠券看板功能增强 | Dashboard/Drilldown | coupon-dashboard | `#dashboard` / `#records` | page | coupon-dashboard | 增加数据更新时间与刷新、活动明细表；指标卡、趋势点和来源项下钻至现有记录页并自动携带时间、活动、优惠券和来源筛选；异常提示及异常记录下钻后续撤销；记录页补充看板上下文与日期范围过滤；保持稳定 mock 汇总和窄窗口自适应 | Completed |
| T040 | 数据与记录 | 优惠券看板核心指标调整 | Dashboard | coupon-dashboard | `#dashboard` | page | coupon-dashboard | 用户要求撤回“整体收敛为三项核心指标”的调整，本任务不作为当前展示口径生效 | Skipped |
| T041 | 数据与记录 | 优惠券看板局部三字段修正 | Dashboard | coupon-dashboard | `#dashboard` | page | coupon-dashboard | 恢复四项核心指标及活动明细实际优惠金额；仅在红框趋势图内增加实际到账券数、核销次数、核销率三个统计系列，不新增统计表 | Completed |
| T042 | 活动管理中心 | 储值活动充值梯度 | Create/Edit/Detail Modal | activity-form | `#activity-form` | modal | activity-list | 将充值金额和关联优惠券统一收纳到发放内容下的“充值梯度”小分级；每个梯度可配置充值金额、多条关联优惠券及各自发放数量，支持新增、删除梯度和梯度内关联券，详情弹窗按同结构只读展示并同步更新预览 | Completed |
| T043 | 活动管理中心 | 充值梯度多券关联 | Create/Edit/Detail Modal | activity-form | `#activity-form` | modal | activity-list | 每个充值梯度可继续添加多种关联优惠券，每张券独立配置发放数量，支持删除梯度内关联券；保存、预览和详情只读展示同步覆盖全部关联券 | Completed |
| T044 | 优惠券中心 | 优惠券有效期列表展示 | List | coupon-list | `#coupon-form` | page | - | 历史展示要求，已按后续需求从优惠券列表移除“有效期”列；详情和配置规则保持不变 | Superseded |
| T045 | 优惠券中心 | 优惠券创建更新时间表头 | List | coupon-list | `#coupon-form` | page | - | 优惠券列表原“创建时间”表头改为“创建/更新时间” | Completed |
| T046 | 数据与记录 | 看板活动明细关联字段 | Dashboard | dashboard | `#dashboard` | page | - | 活动明细表新增“优惠券名称”“发放来源”表头，并按当前活动、优惠券和来源筛选展示关联 mock 数据 | Completed |
| T047 | 数据与记录 | 看板活动明细行内展开 | Inline Expansion | dashboard-activity-detail | `#dashboard` | inline | dashboard | 点击活动明细行在当前行下方展开，按“活动名称 › 优惠券名称 › 发放来源”展示，保证每行三层级均为唯一值 | Completed |
| T048 | 数据与记录 | 看板活动明细展开提示精简 | Inline Expansion | dashboard-activity-detail | `#dashboard` | inline | dashboard | 移除展开区上方的层级提示行，明细行沿用大表列结构对齐展示 | Completed |
| T049 | 优惠券中心 | 优惠券详情查看核销记录 | Detail Action | coupon-detail-usage-records | `#coupon-detail` | inline | coupon-detail | 详情右侧增加“查看核销记录”按钮，进入现有核销记录页并携带当前优惠券配置筛选 | Completed |
| T050 | 优惠券中心 | 优惠券表单移除发放说明 | Form UI | coupon-form-boundary-note | `#coupon-form` | page | coupon-form | 删除表单底部“发放说明”提示，不影响表单操作区 | Completed |
| T051 | 数据与记录 | 看板活动明细去除展开框 | Inline Expansion | dashboard-activity-detail-style | `#dashboard` | inline | dashboard-activity-detail | 去除展开明细内部边框和圆角，使明细行直接融入大表折叠区域 | Completed |
| T052 | 数据与记录 | 看板活动明细复用大表列宽字体 | Inline Expansion | dashboard-activity-detail-aligned-rows | `#dashboard` | inline | dashboard-activity-detail | 展开明细改为主表 tbody 中的直接行，复用大表列宽、字体和单元格样式 | Completed |
| T053 | 优惠券中心 | 草稿优惠券直接删除 | List Action | coupon-draft-delete | `#coupon-form` | inline | coupon-list | 已移除：当前优惠券配置不使用状态；任意配置均通过二次确认删除（以 T095 为准） | Removed |
| T054 | 数据与记录 | 看板活动明细折叠符号 | Inline Expansion | dashboard-activity-detail-toggle | `#dashboard` | inline | dashboard-activity-detail | 活动汇总行最右侧显示展开/收起符号，并与明细折叠状态同步 | Completed |
| T055 | 优惠券中心 | 券模板适用范围层级展示 | List Display | template-scope-hierarchy | `#templates` | page | templates | 适用范围无配置时显示“全部”，有配置时按“游戏：XX > 项目：XX > 商品：XX”展示，多条范围并列显示 | Completed |
| T056 | 优惠券中心 | 券模板适用范围层级折叠 | List Display | template-scope-hierarchy-collapse | `#templates` | page | templates | 适用范围从上级到下级遇到“全部”即停止展示，不显示该级及其下级层级 | Completed |
| T057 | 优惠券中心 | 默认券模板名称 | List Display | template-default-names | `#templates` | page | templates | 四个默认券模板名称依次为“新客券”“免减券”“折扣券”“节日券” | Completed |
| T058 | 优惠券中心 | 默认券模板适用范围 | List Display | template-default-scope | `#templates` | page | templates | 四个默认券模板适用范围均为全部，不限制游戏、项目和商品 | Completed |
| T059 | 数据与记录 | 发放与核销记录页面完善 | List/Tabs | coupon-records | `#records` | page | - | 保留四个事件流水页签；活动、优惠券、发放来源级联筛选；支持昨天、今天、近7天、近30天和自定义日期；统一展示记录ID、活动、优惠券、来源、顾客、订单/券实例、状态、摘要、时间和操作；看板下钻携带筛选上下文 | Completed |
| T060 | 数据与记录 | 发放与核销记录 UI 组件补齐 | List UI | coupon-records-ui | `#records` | page | coupon-records | 完整呈现时间筛选、关联筛选、关键词搜索、三个业务页签、完整流水表、状态组件和详情入口；异常与补偿相关页签、状态筛选及提示已移除 | Completed |
| T061 | 数据与记录 | 发放与核销记录页面布局完善 | Page Layout | coupon-records-layout | `#records` | page | coupon-records | 曾补齐记录页标题、页面说明和返回看板操作区 | Reverted |
| T062 | 数据与记录 | 移除多余顶部区域 | Page Layout | coupon-top-actions-cleanup | `#dashboard` / `#records` | page | coupon-dashboard / coupon-records | 移除看板右上跳转按钮，以及记录页标题、说明和返回按钮区；页面从系统面包屑后直接进入筛选与内容区域 | Completed |
| T063 | 数据与记录 | 看板时间筛选增加全部 | Filter | dashboard-range-all | `#dashboard` | inline | coupon-dashboard | 时间筛选新增“全部”，按全量 mock 数据统计并保留昨天、今天、近7天、近30天 | Completed |
| T064 | 数据与记录 | 记录页时间筛选增加全部并优化布局 | Filter/Layout | records-range-all-layout | `#records` | inline | coupon-records | 在近30天右侧增加“全部”，补齐筛选卡内边距，桌面端关联选择器使用合理固定宽度并让搜索区域与上方筛选控件列对齐，窄窗口恢复满宽 | Completed |
| T065 | 数据与记录 | 记录页搜索条件拆分 | Filter | records-search-split | `#records` | inline | coupon-records | 将关键词搜索拆分为“搜索记录ID、活动或优惠券”和“搜索顾客”两个独立等宽条件，分别提交并叠加过滤 | Completed |
| T066 | 数据与记录 | 记录详情改为居中弹窗 | Interaction/Layout | records-detail-modal | `#records` | modal | coupon-records | 记录详情由右侧抽屉改为居中弹窗，展示关联信息、结果信息和状态时间线 | Completed |
| T067 | 数据与记录 | 订单号改为 20 位纯数字 | Data Display | records-order-number | `#records` | inline | coupon-records | 记录表和详情中的订单号使用 20 位纯数字，券实例号保持独立展示 | Completed |
| T068 | 数据与记录 | 看板来源模块命名调整 | Copy | dashboard-source-title | `#dashboard` | inline | coupon-dashboard | 看板来源分布模块标题统一为“发放来源”，并明确按发放来源统计实际到账券实例 | Completed |
| T069 | 活动管理 | 活动详情增加查看发放记录 | Interaction | activity-grant-records | `#activity-other` / `#activities` | modal | activity-detail | 活动详情右侧预览区增加“查看发放记录”，进入发放记录并带入当前活动筛选 | Completed |
| T070 | 优惠券中心 | 优惠券详情增加查看发放记录 | Interaction | coupon-grant-records | `#coupon-form` | modal | coupon-detail | 优惠券详情关联活动下增加“查看发放记录”，进入发放记录并带入当前优惠券筛选；保留查看核销记录 | Completed |
| T071 | 数据与记录 | 记录筛选主数据与中心列表一致 | Filter | records-master-options | `#records` | inline | coupon-records | 记录页活动、优惠券下拉默认直接使用活动管理中心和优惠券中心的主数据；选择活动、优惠券或来源后继续按关联关系收窄 | Completed |
| T072 | 活动管理 | 活动详情增加关联优惠券/CDK批次区域 | Interaction | activity-associated-detail-links | `#activity-other` / `#activities` | modal | activity-detail | 活动详情右侧增加独立的关联区域，关联优惠券或 CDK 批次以卡片形式展示并分别跳转到对应详情 | Completed |
| T073 | 活动管理 | 充值梯度编辑按钮状态保留 | Interaction | activity-tier-draft-state | `#activities` | modal | 编辑已有储值活动时点击“再加一种券”或“新增充值梯度”后保留当前表单草稿，不被原始活动数据覆盖 | Completed |
| T074 | 活动管理 | 充值梯度局部更新与边界适配 | Interaction | activity-tier-local-update | `#activities` | modal | 充值梯度按钮只局部更新梯度区域，避免整个弹窗刷新；关联券、数量和删除操作在窄宽度下不溢出 | Completed |
| T075 | 活动管理 | 充值梯度列宽与控件尺寸调整 | Layout | activity-tier-column-sizing | `#activities` | modal | 充值金额与关联优惠券两列均衡分配空间，数量输入跟随关联券列宽自适应 | Completed |
| T076 | 活动管理 | 充值梯度关联券行列对齐 | Layout | activity-tier-row-alignment | `#activities` | modal | 首行与后续关联优惠券行统一预留操作列，选择框、数量框和删除操作保持列对齐 | Completed |
| T077 | 活动管理 | 移除充值梯度底部辅助说明 | Content | activity-tier-helper-copy | `#activities` | modal | 移除新增充值梯度按钮下方的冗余说明文字 | Completed |
| T078 | 活动管理 | 活动详情右侧区域顺序调整 | Layout | activity-detail-side-order | `#activity-other` / `#activities` | modal | 活动详情右侧先展示关联优惠券/CDK批次，再展示查看发放记录 | Completed |
| T079 | CDK管理 | CDK详情关联优惠券多选与详情入口 | Interaction | cdk-detail-coupon-links | `#cdk-management` | modal | CDK详情支持展示多个关联优惠券，并可分别点击查看优惠券详情 | Completed |
| T080 | 优惠券中心 | 优惠券详情关联活动与CDK跳转 | Interaction | coupon-detail-associations | `#coupon-form` | modal | 优惠券详情中的关联活动可进入活动详情；存在关联CDK时展示批次区域并可进入CDK详情 | Completed |
| T081 | 优惠券中心 | 合并发放与核销记录入口 | Interaction | coupon-detail-records-entry | `#coupon-form` | modal | 优惠券详情将查看核销记录和查看发放记录合并为查看发放与核销记录 | Completed |
| T082 | 活动管理 | 统一活动详情记录入口文案 | Copy | activity-detail-records-entry | `#activity-other` / `#activities` | modal | 活动详情记录入口统一为查看发放与核销记录 | Completed |
| T083 | 全局交互 | 弹窗打开时保持左侧导航可操作 | Interaction | modal-sidebar-navigation | all routes | global | 所有弹窗打开时左侧导航仍可点击，切换标签时关闭当前弹窗并进入目标页面 | Completed |
| T084 | 全局交互 | 页面切换后恢复离开时状态 | Interaction | route-view-state-restore | all routes | global | 页面切换返回时保留筛选、页签、分页等已有状态，并恢复列表滚动位置 | Completed |
| T085 | 全局交互 | 按页面单元保存弹窗状态 | Interaction | modal-scoped-route-state | all routes | global | 离开当前最小视图单元时关闭当前浮层但保存弹窗状态，返回原视图单元后恢复；其他视图单元不显示该弹窗 | Completed |
| T086 | 新增优惠券可不选模板发布 | 放开新增优惠券发布前的券模板必选校验 | Interaction | coupon-publish-without-template | `#coupon-create-form` | action | coupon-create-form | 有模板时继续校验模板可用性；未选择模板时按当前优惠券规则校验并支持直接发布 | Completed |
| T087 | 全局交互 | 扩展视图单元切换边界 | Interaction | view-unit-switch-state | all routes | global | 左侧导航、页签、筛选、搜索、分页和每页条数切换均视为视图单元切换，切换时关闭当前弹窗并按路径、查询和列表状态恢复 | Completed |
| T088 | 全局交互 | 保存发布后关闭编辑弹窗 | Interaction | close-modal-after-save | coupon-create-form / templates | action | save | 优惠券和券模板保存或发布成功后清除当前弹窗快照，不恢复已完成的编辑弹窗 | Completed |
| T089 | 全局交互 | 关闭弹窗闪烁动效 | Interaction | modal-animation-off | all modal surfaces | style | all modals | 关闭抽屉、居中详情、确认框、券模板和优惠券编辑弹窗的进入动画，打开与切换时保持稳定显示 | Completed |
| T090 | 活动管理 | 新增手动发放板块 | Interaction/Layout | manual-grant-center | `#manual-grant` | inline | manual-grant | 支持按用户 UID 选择优惠券配置并生成顾客券实例；仅保留正常人工发券能力 | Completed |
| T091 | 活动管理 | 手动发放活动与优惠券级联 | Filter/Validation | manual-grant-association-filter | `#manual-grant` | inline | manual-grant | UID 下增加必填关联活动下拉，仅展示配置了手动发放触发方式的活动；优惠券配置下拉仅展示所选活动已关联的优惠券，并在提交时复核关联关系 | Completed |
| T092 | 活动管理 | 扩充手动发放活动 mock | Data | manual-activity-mocks | `#activity-other` / `#manual-grant` | inline | activity-list | 保留会员关怀、节日客服等正常人工发券活动 mock，不包含异常账单处置场景 | Completed |

## 设计约束

- 导航层级为：活动中心（一级）→ 优惠券中心（二级：优惠券列表、优惠券管理）；优惠券管理内仅保留“优惠券、优惠券模板”两个同级 Tab。活动管理中心下保留“储值活动”“常规活动”和“发放管理”入口；发放管理内提供 CDK 管理与正常人工发券分页；活动管理中心和数据与记录（优惠券看板、发放与核销记录）保持并列；新增/配置/详情通过列表按钮进入，不重复建设列表入口。顾客小程序端独立保留，管理员小程序端已移除。
- 页面固定当前俱乐部“王者俱乐部”，所有 mock 对象带 `clubId`。
- 活动状态使用未开始、进行中、已结束、已停用；活动新建后直接发布，不提供草稿状态或保存入口。优惠券配置同样直接发布并生效；CDK 批次新建后直接进入进行中，不再提供草稿状态；CDK 状态仅包括进行中、已暂停、已结束、已终止、已过期。
- 券模板规则使用优惠计算方式、顾客资格、场景标签三个正交维度。
- 券模板是可复用规则；优惠券是可生效配置/批次，可基于模板生成，也可在新增优惠券时直接配置；顾客券实例仅在发放执行时生成。新增优惠券配置不创建顾客券，也不修改券模板；关联管理对象只处理活动。
- 静态原型不代表真实接口已经具备，真实接口能力以接口地图盘点为准。
