# 原型生成记录

| Task ID | 页面/能力 | 动作 | 生成/修改文件 | 状态 | 说明 |
|---|---|---|---|---|---|
| T001 | 活动列表 | 调整为储值活动入口并重构列表表头 | `app.js`, `styles.css`, `index.html` | Completed | 活动管理中心下将活动列表命名为储值活动，取消列表页内的双 Tab 分级；默认进入储值活动；仅展示 `type: recharge`；表头为序号、活动名称、充值金额、状态、开始时间、结束时间、关联优惠券、操作；每个储值活动对应一个充值金额；不限时活动的开始时间和结束时间均显示为“长期”；提供多条不同状态的储值活动模拟数据；【新建储值活动】改为弹窗打开，保留原活动表单字段和保存、发布逻辑；列表移除直接编辑入口，编辑保留在详情页和详情弹窗；复制操作改为“复制并新建”，自动打开新建储值活动弹窗并回填全部字段，名称追加“（副本）”；已停用活动可重新启用；支持分页且筛选/搜索后回到第 1 页；其他活动作为独立入口展示后续开放占位 |
| T002 | 新建/编辑活动 | 重构活动弹窗字段与发放内容 | `app.js`, `styles.css` | Completed | 移除选择活动场景、发放触发规则、发布前检查和关联优惠券配置区块；将充值发放、自动发放、主动领取、手动发放、CDK兑换统一放入触发方式选项，当前页固定充值发放场景并选择充值送券，其他方式置灰；新增活动时间字段，使用一个长期开关控制开始日期与结束日期选框（中间带分隔符，开启后两个日期框同时置灰），新建活动默认开启长期；新增充值金额、关联优惠券、限制领取开关、条件展示的限领次数及加减控件，移除发放总量字段；新建和编辑均在同一弹窗中完成，编辑从只读详情弹窗切换为可编辑表单；保留活动类型/充值模式底层字段、详情页关联信息及保存发布逻辑 |
| T003 | 活动详情 | 改为与新建储值活动字段一致的只读详情弹窗 | `app.js`, `styles.css` | Completed | 列表详情在当前页弹窗打开，展示基本信息、触发方式、活动时间、目标资格、充值金额、关联优惠券、限制领取；详情页和详情弹窗均保留编辑入口 |
| T004 | 券模板 | 创建模板列表、筛选和规则锁定提示，并提供“新建券模板”入口 | `index.html`, `app.js`, `styles.css` | Completed | 覆盖计算方式、资格、状态和复制版本 |
| T005 | 新建/编辑券模板 | 将模板配置表单收敛为券模板列表页内弹窗；复制新版本保留完整编辑页 | `app.js`, `styles.css` | Completed | 覆盖固定减免/折扣、场景标签、范围、有效期、使用方式和校验 |
| T006 | 券模板详情 | 创建规则、引用活动、数据三个页签 | `app.js`, `styles.css` | Completed | 展示规则快照及复制新版本入口 |
| T007 | 优惠券看板 | 创建指标卡、趋势、来源分布和口径说明 | `app.js`, `styles.css` | Completed | 覆盖触发量、领取量、到账实例、核销实例、核销率、核销次数等 |
| T008 | 发放与核销记录 | 创建发放、领取、核销、异常四类记录页签 | `app.js`, `styles.css` | Completed | 支持来源/状态筛选和活动关联筛选 |
| T009 | 记录详情与异常补偿 | 创建右侧详情抽屉和状态时间线 | `app.js`, `styles.css` | Completed | 支持 consume 重试和人工补偿演示 |
| T010 | 共享运行时 | 创建 hash 路由、mock 数据、Toast、确认弹窗和重置 | `index.html`, `app.js` | Completed | 通过 Node 语法检查、全路由运行冒烟和本机 HTTP 浏览器冒烟测试 |
| T011 | 优惠券列表 | 将主列表调整为优惠券配置/批次列表，支持筛选、详情和关联记录 | `index.html`, `app.js`, `styles.css` | Completed | 不展示顾客券实例；顾客实例下沉到记录和详情示例 |
| T012 | 新增优惠券配置 | 从列表进入：可选择一个券模板，也可不选模板直接配置规则，并关联多个活动后保存草稿/发布 | `index.html`, `app.js`, `styles.css` | Completed | 保存配置不会直接生成 CouponInstance；后续发放保留规则快照 |
| T013 | 发放规则 | 建立独立可复用发放规则列表、配置页和详情页 | `index.html`, `app.js`, `styles.css` | Completed | 支持新客、充值、主动领取、人工、CDK；一条规则可关联多个优惠券；配置页按参考稿收敛为活动名称、触发方式、发放窗口、目标资格、发放内容、每人限制、发放总量及触发专属配置 |
| T014 | 优惠券配置详情 | 增加配置详情、关联活动/规则和人工发券执行入口 | `app.js`, `styles.css` | Completed | 关联流程回到列表选择；顾客券实例明细进入发放与核销记录 |
| T015 | 原型结构修订 | 调整活动表单关联方式、默认模板临时使用、记录配置筛选、指标展示、优惠券导航层级和页头信息密度 | `index.html`, `app.js`, `styles.css`, `README.md`, `prototype-index.md` | Completed | 优惠券列表与优惠券管理并列；券模板/发放规则改为优惠券管理内的三级 Tab；统一移除各页面标题下方描述，保留页面内部规则说明；保留新增配置、默认模板带入、异常重试和人工发券验证 |
| T016 | 新增优惠券页面重构 | 按券类型 → 基础信息 → 动态高级设置 → 关联对象重排配置流程 | `app.js`, `styles.css`, `README.md`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 五种券类型卡片可点击；自定义类型可在类型区域选择可复用券模板，也可直接配置；类型切换会更新优惠计算、有效期、使用方式、资格和场景标签；关联对象集中在最后一步且只保留发放规则和活动，保留草稿/发布流程 |
| T017 | 活动中心导航调整 | 删除活动管理中心下的“发放规则”直达入口 | `index.html`, `prototype-index.md` | Completed | 仅移除活动中心侧边栏直达入口，作为过渡版本保留原有发放规则页面及关联流程 |
| T018 | 活动中心导航补充 | 增加“CDK管理”入口字段 | `index.html`, `app.js`, `prototype-index.md` | Completed | 入口位于活动管理中心下，本期仅保留导航字段；点击提示页面待开放，不设计 CDK 管理页面 |
| T019 | 活动中心导航层级调整 | 将“其他活动”入口提升至活动管理中心同级导航 | `index.html`, `app.js`, `prototype-index.md` | Completed | 增加独立导航入口并复用活动列表完整结构，展示非 `recharge` 模拟活动；其他活动新建入口复用储值活动表单弹窗 |
| T020 | 其他活动列表筛选 | 增加活动类型下拉筛选框 | `app.js`, `prototype-index.md` | Completed | 筛选框位于其他活动列表状态筛选右侧，提供新客活动、主动领券两类筛选，筛选后分页回到第 1 页 |
| T021 | 其他活动列表字段 | 将第三列表头由“充值金额”改为“活动类型” | `app.js`, `prototype-index.md` | Completed | 其他活动行内同步展示新客活动、主动领券等活动类型；储值活动仍展示充值金额 |
| T022 | 其他活动新建入口 | 复用储值活动新建弹窗结构与字段 | `app.js`, `prototype-index.md` | Completed | 点击其他活动页【新建活动】直接打开储值活动同款弹窗，复用活动时间、触发方式、关联优惠券和领取限制等字段；充值金额按其他活动规则隐藏 |
| T023 | 其他活动新建表单 | 区分其他活动新建字段与储值活动字段 | `app.js`, `prototype-index.md` | Completed | 其他活动新建标题改为【新建活动】；活动类型可选；触发方式开放自动发放、主动领取、手动发放、CDK兑换，充值送券后置并置灰；发放内容隐藏充值金额；储值活动表单保持固定充值送券及充值金额 |
| T024 | 储值活动新建表单 | 调整充值金额字段位置 | `app.js`, `prototype-index.md` | Completed | 储值活动新建弹窗中将充值金额板块移动至触发方式与活动时间之间；其他活动新建弹窗继续隐藏充值金额 |
| T025 | 其他活动模拟数据 | 补充其他活动列表演示数据 | `app.js` | Completed | 新增多条新客活动与主动领券活动，覆盖进行中、已停用、草稿等状态，供活动类型筛选、分页、详情和状态操作演示 |
| T026 | CDK管理页面 | 复用活动列表结构搭建 CDK 管理页 | `index.html`, `app.js`, `prototype-index.md` | Completed | 增加 CDK 批次模拟数据、搜索、状态筛选、分页和详情弹窗，并将侧边栏入口从占位提示切换为页面路由 |
| T027 | CDK触发关联 | 联动活动表单的 CDK 触发方式和关联内容 | `app.js`, `prototype-index.md` | Completed | 选择 CDK兑换时将发放内容中的“关联优惠券”切换为“关联CDK批次”，切换触发方式时同步清理另一类关联数据并更新预览 |
| T028 | 其他活动列表字段 | 补充触发方式筛选和关联对象表头 | `app.js`, `prototype-index.md` | Completed | 其他活动增加触发方式下拉筛选和触发方式列，关联列统一命名为“关联优惠券/CDK”，CDK触发活动按批次数量统计 |
| T029 | CDK批次列表字段 | 调整 CDK 批次列表展示和操作 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 活动类型改为关联活动，增加码模式；总数量、已兑换、剩余数量合并为带百分比进度条的核销进度；操作补充导出码列表、暂停发放和终止批次 |
| T030 | 新建CDK批次 | 增加 CDK 批次创建弹窗和关联券字段 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 新建 CDK 批次改为弹窗，包含批次名称、批次类别、码模式、指定码、总可核销次数、生效开始日期、生效截止日期和关联券；增加必填校验、次数加减控件、草稿批次生成和保存反馈 |
| T031 | CDK码模式与生效日期 | 优化码模式选项和日期区间布局 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 码模式调整为“共享码/唯一码”；仅共享码显示指定码，唯一码隐藏；生效开始日期和生效截止日期合并为同一行并保留“至”分隔符 |
| T032 | CDK关联券配置 | 支持新建批次关联多张券 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 关联券改为可重复配置列表，支持继续添加和逐行删除；保存时同步写入全部关联券 ID 与名称 |
| T018 | 发放规则层级下线 | 完全移除发放规则页面、路由和关联流程 | `app.js`, `index.html`, `prototype-index.md` | Completed | 优惠券配置与活动仅保留活动关联；发放规则不再作为本期原型层级展示或进入 |
| T033 | 其他活动详情规则 | 详情弹窗跟随其他活动新建规则 | `app.js`, `prototype-index.md` | Completed | 详情展示实际活动类型和触发方式；充值送券后置并置灰；隐藏充值金额；CDK触发时展示关联CDK批次；从详情进入编辑时继续使用其他活动表单规则 |
| T034 | 活动时限筛选 | 活动列表增加活动时限筛选 | `app.js`, `prototype-index.md` | Completed | 储值活动与其他活动列表新增“活动时限”下拉框，提供“长期/限时”；开始和结束时间均为长期时筛选为长期，其余活动归为限时，筛选后分页回到第 1 页 |
| T035 | 优惠券看板重构 | 重构日常监控看板 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 看板改为四项核心指标卡、到账券实例趋势和实际到账来源分布；时间筛选调整为昨天/今天/近7天/近30天，优惠券筛选改为实际优惠券配置/批次；删除成交额、主动领取成功量和券均核销次数展示；核销次数与实例核销率采用不同统计口径并补充说明 |
| T036 | 优惠券看板 | 删除指标口径提示框 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 删除看板趋势区下方独立的“指标口径”提示框及对应样式，保留核心指标卡和趋势/来源展示 |
| T037 | 优惠券列表 | 到期时间展示有效期末日 | `app.js` | Completed | 固定日期优惠券的到期时间改为仅展示有效期结束日期；领取后自然日模式继续按领取日动态计算 |
| T038 | 优惠券看板 | 联动活动、优惠券与发放来源筛选 | `app.js`, `prototype-index.md` | Completed | 三个业务维度按优惠券配置的活动关联和发放来源快照动态收窄选项，并自动清理不再匹配的已选条件；时间筛选保持独立 |
| T039 | 优惠券看板 | 增强运营监控、下钻和异常处理 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 增加更新时间/刷新、待处理异常提示、活动明细表；指标卡、趋势点、来源项下钻到记录页并携带时间/活动/优惠券/来源筛选；记录页补充看板上下文和日期范围过滤；刷新不改变稳定 mock 统计结果 |
| T040 | 优惠券看板 | 收敛核心指标为三项 | `app.js`, `styles.css`, `prototype-index.md` | Skipped | 用户要求撤回整体收敛为三项核心指标的调整 |
| T041 | 优惠券看板 | 局部三字段修正 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 恢复四项核心指标与活动明细实际优惠金额；红框趋势图内增加实际到账券数、核销次数、核销率三个统计系列，不新增统计表 |
| T042 | 储值活动充值梯度 | 支持每个充值梯度关联多张券 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 每个充值梯度可配置充值金额、多条关联优惠券和各自发放数量，支持新增与删除梯度及梯度内关联券；创建/编辑表单同步预览，详情弹窗按同结构只读展示 |
| T043 | 充值梯度多券关联 | 为每个梯度增加多券配置能力 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 每个梯度可继续添加或删除关联优惠券，每张券独立维护发放数量；保存、预览和详情展示覆盖全部关联券 |
| T044 | 优惠券有效期列表展示 | 表头改为有效期并统一展示有效期区间/自然日规则 | `app.js`, `prototype-index.md` | Completed | 列表表头改为“有效期”；领取后自然日展示“领取后 N 个自然日”，固定日期展示开始日期—结束日期 |
| T045 | 优惠券创建更新时间表头 | 将创建时间表头改为创建/更新时间 | `app.js`, `prototype-index.md` | Completed | 优惠券列表时间字段表头已改为“创建/更新时间”，保留现有时间值展示 |
| T046 | 看板活动明细关联字段 | 在活动明细表增加优惠券名称、发放来源列并补齐筛选后的关联 mock 数据 | `app.js`, `prototype-index.md` | Completed | 活动明细表新增两列，内容随当前活动、优惠券和发放来源筛选联动 |
| T047 | 看板活动明细行内展开 | 将活动明细行点击交互改为当前行下方展开，按活动、优惠券、来源拆分唯一组合 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 不再使用侧边抽屉；展开区每行只保留一个活动、一个优惠券和一个来源，并保留对应统计数据 |
| T048 | 看板活动明细展开提示精简 | 删除展开区上方的层级说明和查看记录提示行，明细行按大表列结构对齐 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 保留下方唯一组合明细表，减少重复提示 |
| T049 | 优惠券详情查看核销记录 | 在只读详情右侧关联活动卡片下增加“查看核销记录”按钮，跳转核销记录页并按优惠券配置筛选 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 复用现有记录页和 couponConfigId 筛选 |
| T050 | 优惠券表单移除发放说明 | 删除表单底部“发放说明”提示并清理无用样式 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 保留取消、保存草稿、发布优惠券操作 |
| T051 | 看板活动明细去除展开框 | 去除展开明细内部边框和圆角，保留折叠行分隔线与列对齐 | `styles.css`, `prototype-index.md` | Completed | 明细内容直接融入大表展开区域 |
| T052 | 看板活动明细复用大表列宽字体 | 将展开明细改为主表 tbody 中的直接行，移除嵌套 grid，复用主表单元格样式 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 保留状态列空位以维持指标列对齐 |
| T053 | 草稿优惠券直接删除 | 在草稿优惠券行显示删除按钮，点击后直接移除草稿并清理活动/CDK关联 | `app.js`, `prototype-index.md` | Completed | 非草稿状态不显示删除按钮，不弹确认框 |
| T054 | 看板活动明细折叠符号 | 在活动汇总行最右侧增加展开/收起符号，随行内明细状态切换 | `app.js`, `styles.css`, `prototype-index.md` | Completed | 点击整行或符号均可切换 |
| T055 | 券模板适用范围层级展示 | 券模板列表适用范围统一为“全部”或三级层级路径 | `app.js`, `prototype-index.md` | Completed | 兼容旧版游戏/服务范围数据，多条范围去重后并列展示 |
| T056 | 券模板适用范围层级折叠 | 适用范围路径按上级优先展示 | `app.js`, `prototype-index.md` | Completed | 游戏为全部时仅显示“全部”；项目或商品为全部时隐藏本级及下级 |
| T057 | 默认券模板名称 | 调整四个默认券模板的名称 | `app.js`, `prototype-index.md` | Completed | 默认模板依次显示为“新客券”“免减券”“折扣券”“节日券” |
| T058 | 默认券模板适用范围 | 将四个默认券模板范围设为全部 | `app.js`, `prototype-index.md` | Completed | 清空默认模板的游戏和服务范围配置，列表统一显示“全部” |
| T059 | 发放与核销记录页面完善 | 完善四个记录页签、级联筛选、日期范围和事件流水详情 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 默认近30天；支持快捷时间与自定义日期互斥、活动/优惠券/发放来源级联、完整记录字段、详情关联信息与状态时间线，并保留待补偿重试/人工补偿 |
| T060 | 发放与核销记录 UI 组件补齐 | 补齐记录行状态与页面展示组件 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 人工发券与 CDK 兑换 mock 行补充“成功”状态，确保所有流水行均展示明确状态组件；筛选、页签、表格、详情入口和状态说明保持完整 |
| T061 | 发放与核销记录页面布局完善 | 补齐记录页标题与顶部操作区 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 记录页增加完整标题、说明和返回优惠券看板按钮，筛选区不再承担页面顶部空白区域 |
| T062 | 移除多余顶部区域 | 撤回看板和记录页顶部红框区域 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 移除看板右上“查看发放与核销记录”按钮，以及记录页标题、说明和返回看板按钮区，保留系统面包屑和主体内容 |
| T063 | 看板时间筛选增加全部 | 增加全量时间筛选项 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 看板时间筛选新增“全部”，选择后使用全量 mock 汇总；原有四个时间范围保持不变 |
| T064 | 记录页时间筛选增加全部并优化布局 | 补齐记录页全量筛选、内边距并修正控件宽度与列对齐 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | “全部”位于“近30天”右侧；筛选卡补齐与看板一致的内边距，桌面端关联选择器收窄为合理固定宽度，搜索区域与时间、关联筛选控件列对齐，窄窗口恢复满宽 |
| T065 | 记录页搜索条件拆分 | 拆分记录主关键词与顾客搜索并统一框宽 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 新增“搜索记录ID、活动或优惠券”和“搜索顾客”两个独立等宽搜索区，支持分别查询并叠加过滤 |
| T066 | 记录详情改为居中弹窗 | 将记录详情从侧边抽屉切换为居中弹窗 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 保留详情内容、状态时间线和待补偿操作，改用居中、限高、可滚动的弹窗容器 |
| T067 | 订单号改为 20 位纯数字 | 调整记录 mock 订单号格式 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 订单号统一为 20 位纯数字，券实例号保持 CPN-I 格式 |
| T068 | 看板来源模块命名调整 | 将来源分布标题改为发放来源 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 来源卡片标题更新为“发放来源”，说明文案同步明确统计实际到账券实例 |
| T069 | 活动详情增加查看发放记录 | 在活动详情右侧预览区增加发放记录入口 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 新增“查看发放记录”按钮，点击进入发放记录并携带活动筛选 |
| T070 | 优惠券详情增加查看发放记录 | 在优惠券详情关联活动下增加发放记录入口 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 新增“查看发放记录”按钮，点击进入发放记录并携带优惠券筛选，与查看核销记录并列保留 |
| T071 | 记录筛选主数据与中心列表一致 | 调整活动与优惠券筛选选项来源 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 未选择关联条件时直接展示活动中心和优惠券中心的完整主数据；选择活动、优惠券或来源后按记录关联关系收窄 |
| T072 | 活动详情增加关联优惠券/CDK批次区域 | 在活动详情右侧增加独立关联区域 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 左侧发放内容保持只读表单样式；右侧新增关联区域，卡片点击分别打开优惠券详情或 CDK 批次详情 |
| T073 | 充值梯度编辑按钮状态保留 | 修正已有活动编辑时草稿被原始数据覆盖的问题 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | “再加一种券”和“新增充值梯度”点击后正确保留并显示新增内容 |
| T074 | 充值梯度局部更新与边界适配 | 避免梯度操作触发整页重绘并修正控件溢出 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 梯度和关联券增删只替换当前梯度区域，金额、选择器、数量及删除文字在边界内收缩显示 |
| T075 | 充值梯度列宽与控件尺寸调整 | 均衡充值金额与关联券区域宽度 | `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 两列改为均衡布局，数量输入覆盖旧固定宽度规则，按右侧区域自适应 |
| T076 | 充值梯度关联券行列对齐 | 为无删除按钮的首行预留操作列 | `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 首行与后续行使用相同网格列宽，避免首行选择框单独变宽 |
| T077 | 移除充值梯度底部辅助说明 | 删除按钮下方冗余提示文字 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 保留“新增充值梯度”按钮，移除“每个梯度可配置多种关联优惠券及各自发放数量”说明 |
| T078 | 活动详情右侧区域顺序调整 | 调换关联区域与发放记录入口的位置 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 右侧先显示关联优惠券/CDK批次区域，再显示查看发放记录按钮 |
| T079 | CDK详情关联优惠券多选与详情入口 | 为 CDK 详情增加多个优惠券关联展示及逐项查看详情入口 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | CDK mock 批次支持多个 couponIds，详情中每张关联优惠券均可打开优惠券详情 |
| T080 | 优惠券详情关联活动与CDK跳转 | 将优惠券详情关联区域改为可交互，并增加关联CDK批次区域 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 关联活动进入活动详情；有CDK关联时显示批次卡片并进入CDK详情 |
| T081 | 合并发放与核销记录入口 | 将优惠券详情右侧的两个记录按钮合并为一个入口 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 点击“查看发放与核销记录”进入记录页，记录页内继续保留各记录页签 |
| T082 | 统一活动详情记录入口文案 | 将活动详情中的查看发放记录入口改为统一文案 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 活动详情右侧显示“查看发放与核销记录” |
| T083 | 弹窗打开时保持左侧导航可操作 | 调整侧边栏层级，使弹窗遮罩不阻断左侧标签操作 | `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 所有弹窗打开时左侧导航位于遮罩之上，导航切换沿用 navigate 自动关闭弹窗 |
| T084 | 页面切换后恢复离开时状态 | 增加路由级视图状态记录与滚动位置恢复 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 现有筛选、页签、分页状态继续保留，并在返回路由时恢复离开前滚动位置 |
| T085 | 按页面单元保存弹窗状态 | 将弹窗状态写入当前路由视图快照，离开当前视图单元时关闭浮层，返回原视图单元时恢复 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 弹窗只显示在所属视图单元，A→B 时 B 不显示 A 的弹窗，返回 A 时恢复原弹窗 |
| T086 | 新增优惠券可不选模板发布 | 放开新增优惠券发布前的券模板必选校验 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 有模板时继续校验模板可用性；未选择模板时按当前优惠券规则校验并支持直接发布 |
| T087 | 扩展视图单元切换边界 | 将左侧导航之外的页签、筛选、搜索、分页和每页条数切换统一接入视图状态快照 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 所有列表视图切换都会关闭当前弹窗；返回原路径、查询和列表状态时恢复对应弹窗与滚动位置 |
| T088 | 保存发布后关闭编辑弹窗 | 优惠券和券模板保存/发布成功前清除当前路由弹窗快照 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 保存成功后不因同一路由重新渲染而恢复已完成的编辑弹窗 |
| T089 | 关闭弹窗闪烁动效 | 移除抽屉、居中详情、确认框、券模板和优惠券编辑弹窗的进入动画 | `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 所有弹窗打开和切换时保持稳定显示，不再出现闪烁/位移动画 |
| T090 | 新增手动发放板块 | 活动管理中心增加 UID 发券和异常账单补偿工作台 | `index.html`, `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 选择已发布优惠券配置后按 UID 发券；下方展示待补偿异常账单，可查看详情、重试消费或人工补偿，并复用现有发放与核销记录数据 |
| T091 | 手动发放活动与优惠券级联 | 增加关联活动必填项并限制优惠券配置范围 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 关联活动只展示手动发放活动；优惠券配置只展示当前活动已关联且生效中的配置；提交时再次校验活动触发方式与配置关联关系 |
| T092 | 扩充手动发放活动 mock | 增加多条手动发放触发方式的活动数据 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 新增异常账单补偿、会员专属补发、节日客服关怀等活动，并将人工补发与补偿优惠券配置关联到对应活动 |
| T093 | 移除异常处置与管理员小程序端 | 清理异常账单、重试、补偿和管理员小程序相关原型内容 | `index.html`, `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md`, `prototype-index-review.md` | Completed | 删除异常记录 mock、异常处理工作区和操作、详情页重试/补偿按钮、关联状态与专属样式；人工发券仅保留正常发券；移除管理员小程序入口、路由、页面及样式，顾客小程序端保留 |
| T094 | 清理残留的部分成功发放记录 | 移除带有失败待人工补发文案的旧模拟流水 | `app.js`, `prototype-completeness-check.md` | Completed | 删除部分成功发放流水、失败项明细和对应状态筛选；保留资格不符的领取失败记录及正常核销状态 |
| T095 | 优惠券配置取消状态管理 | 删除配置状态字段及其展示、筛选和启停逻辑；允许删除任意配置 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 配置列表不再按状态区分；活动关联、CDK选券和手动发券不再读取配置状态；所有配置均可通过二次确认删除，解除活动/CDK关联并保留历史流水；活动、CDK批次、券模板及顾客券实例状态不变 |
| T096 | 优惠券列表隐藏最低消费与有效期 | 从优惠券列表移除“最低消费”和“有效期”两列 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 仅调整列表展示；配置详情和编辑表单继续保留最低消费与有效期规则 |
| T097 | 撤回优惠券列表字段隐藏 | 恢复优惠券列表中的“最低消费”和“有效期”列 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 仅撤回 T096 的列表展示变更；其他列表字段与行为保持不变 |
| T098 | 再次移除优惠券列表两列 | 从优惠券列表移除“最低消费”和“有效期”列 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 按最新截图要求隐藏两列；优惠券详情及编辑表单规则不变 |
| T099 | 调整优惠券创建更新时间列顺序 | 将“创建/更新时间”移到“优惠券类型”之前 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 同步调整表头与数据行顺序，确保列位对应 |
| T100 | 调整优惠券发放数量表头 | 将“已发行数量”改为“已发放数量”，将“可用优惠券数”改为“未核销券数” | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 仅调整列表字段名称，数量数据和其他页面口径不变 |
| T101 | 简化优惠券搜索提示 | 将搜索框提示文案改为“搜索配置名称” | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 只调整 placeholder，实际搜索匹配逻辑不变 |
| T102 | 均衡优惠券列表列宽 | 为优惠券配置列表设置固定布局和列宽比例 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 各列按比例均匀分配可用宽度，减少名称与后续字段之间的异常留白，保留窄屏横向滚动 |
| T103 | 统一券模板列表表头 | 券模板列表采用与优惠券列表相同的表头名称及字段顺序 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 模板来源与适用范围保留在名称副标题；发放数量沿用模板统计，未核销数按已发放减已核销计算；使用与优惠券列表一致的均衡固定列宽布局 |
| T104 | 移除优惠券列表名称小字 | 删除优惠券配置名称下方重复的“配置/批次”副标题，保留券模板列表来源与适用范围副标题 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 只移除优惠券配置列表的冗余小字，不影响模板副标题或数据字段 |
| T105 | 移除券模板列表名称小字 | 删除券模板名称下方的来源与适用范围副标题 | `app.js`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 优惠券列表与券模板列表均不再显示名称下的小字；来源和适用范围配置数据保持不变 |
| T106 | 统一 CDK 批次状态 | CDK 批次状态调整为进行中、已暂停、已结束、已终止、已过期，并移除旧状态及草稿逻辑 | `app.js`, `styles.css`, `prototype-index.md`, `prototype-completeness-check.md` | Completed | 新建批次直接进入进行中；运行中可暂停，暂停可恢复，符合条件时可终止；已结束、已终止、已过期不可再操作 |
