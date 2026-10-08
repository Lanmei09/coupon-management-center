(() => {
  'use strict';

  const CLUB = { id: 'club-001', name: '王者俱乐部', timezone: 'Asia/Shanghai' };
  const DEMO_TODAY = '2026-09-14';
  const SOURCE_LABELS = {
    new_customer: '新客自动发',
    recharge: '充值送券',
    claim: '主动领取',
    manual: '人工发券',
    cdk: 'CDK 兑换'
  };
  const ACTIVITY_TYPES = {
    new_customer: '新客活动',
    recharge: '储值活动',
    claim: '主动领券'
  };
  const ACTIVITY_TRIGGER_MODES = {
    auto: '自动发放',
    claim: '主动领取',
    manual: '手动发放',
    cdk: 'CDK兑换',
    recharge: '充值送券'
  };
  const ACTIVITY_SCENES = {
    customer_identity: '客户身份',
    customer_behavior: '客户行为',
    special_time: '特殊时间段'
  };
  const CALC_LABELS = { fixed: '固定减免', discount: '折扣' };
  const ELIGIBILITY_LABELS = { first_order: '首单客户', new_customer: '新客客户', returning_customer: '回流客户', high_value: '高价值客户', unlimited: '全部客户' };
  const USER_QUALIFICATION_OPTIONS = [
    ['first_order', '首单客户'],
    ['new_customer', '新客客户（模拟）'],
    ['returning_customer', '回流客户（模拟）'],
    ['high_value', '高价值客户（模拟）'],
    ['unlimited', '全部客户']
  ];
  const SCOPE_CATALOG = [
    { name: '王者荣耀', categories: [{ name: '竞技陪玩', products: ['排位上分', '巅峰赛组队'] }, { name: '技能陪练', products: ['英雄连招练习', '补位训练'] }, { name: '代练服务', products: ['段位代练', '赛季冲刺'] }] },
    { name: '无畏契约', categories: [{ name: '排位陪玩', products: ['竞技排位局', '爆头训练房'] }, { name: '枪法陪练', products: ['步枪练习', '狙击练习'] }, { name: '代练服务', products: ['段位代练', '赛季代打'] }] },
    { name: '和平精英', categories: [{ name: '组队陪玩', products: ['经典海岛', '特训岛'] }, { name: '战术陪练', products: ['枪法训练', '战术指导'] }, { name: '代练服务', products: ['段位代练', '赛季冲分'] }] }
  ];
  const STATUS_LABELS = {
    scheduled: '未开始', running: '进行中', paused: '已暂停', ended: '已结束', terminated: '已终止', offline: '已停用',
    active: '生效中', disabled: '已停用',
    success: '成功', failed: '失败',
    reserved: '占用中',
    available: '可用', consumed: '已核销', released: '已释放', rolled_back: '已回退', expired: '已过期', invalid: '已失效', enabled: '启用'
  };
  const PAGE_TITLES = {
    activities: '储值活动', 'activity-other': '常规活动', 'activity-form': '新建活动', 'activity-detail': '活动详情',
    templates: '券模板列表', 'coupon-form': '优惠券列表', 'coupon-create-form': '新增优惠券', 'coupon-detail': '优惠券详情', 'cdk-management': 'CDK管理',
    dashboard: '优惠券看板', records: '发放与核销记录', 'distribution-management': '发放管理中心', 'cdk-management': 'CDK管理', 'manual-grant': '手动发放', 'customer-miniapp': '顾客小程序端'
  };
  const PRIMARY_ROUTES = new Set(['activities', 'templates', 'coupon-form', 'dashboard', 'records', 'distribution-management', 'customer-miniapp']);

  let idSeed = 100;
  let toastTimer = null;
  let state = createState();

  const appView = document.getElementById('app-view');
  const backendShell = document.getElementById('backend-shell');
  const modalRoot = document.getElementById('modal-root');
  const toastNode = document.getElementById('toast');
  const breadcrumbNode = document.getElementById('breadcrumb');

  function createState() {
    const templates = [
      {
        id: 'tpl-new', code: 'CPN-NEW-020', name: '新客券', description: '首次成为本俱乐部新客时到账，仅首单可用。',
        calcMethod: 'fixed', amount: 20, threshold: 100, discountRate: 0, maxDiscount: 0,
        eligibility: 'first_order', sceneTags: ['拉新'], scopeGames: [], scopeServices: [],
        validityMode: 'relative', validDays: 7, fixedStart: '', fixedEnd: '', usageMode: 'single', totalAmount: 20, maxUses: 1,
        status: 'active', version: 'v1.0', createdAt: '2026-08-28', issued: 128, redeemed: 64, locked: true, source: 'default', preset: 'new'
      },
      {
        id: 'tpl-threshold', code: 'CPN-FULL-050', name: '免减券', description: '订单服务金额满 500 元可使用。',
        calcMethod: 'fixed', amount: 100, threshold: 500, discountRate: 0, maxDiscount: 0,
        eligibility: 'unlimited', sceneTags: ['日常'], scopeGames: [], scopeServices: [],
        validityMode: 'fixed', validDays: 0, fixedStart: '2026-09-01', fixedEnd: '2026-09-30', usageMode: 'single', totalAmount: 100, maxUses: 1,
        status: 'active', version: 'v1.2', createdAt: '2026-08-20', issued: 86, redeemed: 31, locked: true, source: 'default', preset: 'threshold'
      },
      {
        id: 'tpl-discount', code: 'CPN-DISC-080', name: '折扣券', description: '订单服务金额 8 折，单次最多优惠 50 元。',
        calcMethod: 'discount', amount: 0, threshold: 0, discountRate: 80, maxDiscount: 50,
        eligibility: 'unlimited', sceneTags: ['日常', '回流'], scopeGames: [], scopeServices: [],
        validityMode: 'relative', validDays: 15, fixedStart: '', fixedEnd: '', usageMode: 'single', totalAmount: 0, maxUses: 1,
        status: 'active', version: 'v2.0', createdAt: '2026-08-16', issued: 92, redeemed: 47, locked: true, source: 'default', preset: 'discount'
      },
      {
        id: 'tpl-festival', code: 'CPN-FEST-1111', name: '节日券', description: '周年庆期间使用，指定游戏和服务类型可用。',
        calcMethod: 'fixed', amount: 30, threshold: 200, discountRate: 0, maxDiscount: 0,
        eligibility: 'unlimited', sceneTags: ['节日', '回流'], scopeGames: [], scopeServices: [],
        validityMode: 'fixed', validDays: 0, fixedStart: '2026-11-01', fixedEnd: '2026-11-11', usageMode: 'single', totalAmount: 30, maxUses: 1,
        status: 'active', version: 'v1.0', createdAt: '2026-09-10', issued: 0, redeemed: 0, locked: true, source: 'default', preset: 'festival'
      },
      {
        id: 'tpl-recharge', code: 'CPN-RECH-010', name: '充值赠10元', description: '充值活动达档后到账，可用于下一笔服务订单。',
        calcMethod: 'fixed', amount: 10, threshold: 0, discountRate: 0, maxDiscount: 0,
        eligibility: 'unlimited', sceneTags: ['充值'], scopeGames: [], scopeServices: [],
        validityMode: 'relative', validDays: 30, fixedStart: '', fixedEnd: '', usageMode: 'multi', totalAmount: 10, maxUses: 2,
        status: 'active', version: 'v1.1', createdAt: '2026-08-12', issued: 79, redeemed: 23, locked: false, source: 'custom', preset: ''
      },
      {
        id: 'tpl-custom-king', code: 'CPN-CUST-015', name: '王者荣耀陪玩立减15', description: '王者荣耀陪玩订单满 80 元可用。',
        calcMethod: 'fixed', amount: 15, threshold: 80, discountRate: 0, maxDiscount: 0,
        eligibility: 'unlimited', sceneTags: ['日常'], scopeGames: ['王者荣耀'], scopeServices: ['陪玩'],
        validityMode: 'relative', validDays: 14, fixedStart: '', fixedEnd: '', usageMode: 'single', totalAmount: 15, maxUses: 1,
        status: 'active', version: 'v1.0', createdAt: '2026-09-03', issued: 34, redeemed: 12, locked: false, source: 'custom', preset: ''
      },
      {
        id: 'tpl-custom-rebate', code: 'CPN-CUST-080', name: '充值回流8折券', description: '充值用户回流时可用，单次最高优惠 30 元。',
        calcMethod: 'discount', amount: 0, threshold: 100, discountRate: 80, maxDiscount: 30,
        eligibility: 'unlimited', sceneTags: ['充值', '回流'], scopeGames: [], scopeServices: [],
        validityMode: 'relative', validDays: 15, fixedStart: '', fixedEnd: '', usageMode: 'single', totalAmount: 0, maxUses: 1,
        status: 'active', version: 'v1.0', createdAt: '2026-09-04', issued: 28, redeemed: 9, locked: false, source: 'custom', preset: ''
      },
      {
        id: 'tpl-custom-balance', code: 'CPN-CUST-050', name: '和平精英陪练余额券50', description: '和平精英陪练订单满 200 元可用，可分 5 次抵扣。',
        calcMethod: 'fixed', amount: 50, threshold: 200, discountRate: 0, maxDiscount: 0,
        eligibility: 'unlimited', sceneTags: ['日常'], scopeGames: ['和平精英'], scopeServices: ['陪练'],
        validityMode: 'relative', validDays: 30, fixedStart: '', fixedEnd: '', usageMode: 'multi', totalAmount: 50, maxUses: 5,
        status: 'active', version: 'v1.0', createdAt: '2026-09-06', issued: 19, redeemed: 6, locked: false, source: 'custom', preset: ''
      },
      {
        id: 'tpl-custom-lol', code: 'CPN-CUST-030', name: '英雄联盟新客减30', description: '英雄联盟手游新客首单满 150 元减 30 元。',
        calcMethod: 'fixed', amount: 30, threshold: 150, discountRate: 0, maxDiscount: 0,
        eligibility: 'first_order', sceneTags: ['拉新'], scopeGames: ['英雄联盟手游'], scopeServices: ['代练'],
        validityMode: 'fixed', validDays: 0, fixedStart: '2026-10-10', fixedEnd: '2026-10-31', usageMode: 'single', totalAmount: 30, maxUses: 1,
        status: 'active', version: 'v1.0', createdAt: '2026-09-12', issued: 0, redeemed: 0, locked: false, source: 'custom', preset: ''
      }
    ];

    const activities = [
      {
        id: 'act-new', name: '新客首单礼', type: 'new_customer', sceneCategory: 'customer_identity', status: 'running',
        start: '2026-09-01', end: '2026-10-31', description: '首次成为本俱乐部新客时自动到账，鼓励新客完成首单。',
        trigger: 'club_customer_qualified', triggerText: '首次成为本俱乐部新客', limitText: '每人每活动 1 次',
        bundle: [{ templateId: 'tpl-new', qty: 1 }], tiers: [], triggerCount: 128, instanceCount: 128, redeemedCount: 64, usageCount: 64, gmv: 12800
      },
      {
        id: 'act-recharge', name: '秋季充值回馈', type: 'recharge', rechargeMode: 'limited', sceneCategory: 'customer_behavior', status: 'running',
        start: '2026-09-05', end: '2026-10-15', description: '单笔充值支付成功后按最高档位赠送优惠券。',
        trigger: 'recharge_payment_succeeded', triggerText: '充值支付成功并达到档位', limitText: '每人每活动 1 次',
        bundle: [], tiers: [{ amount: 500, templateId: 'tpl-recharge', qty: 2 }], triggerCount: 76, instanceCount: 91, redeemedCount: 38, usageCount: 52, gmv: 15600
      },
      {
        id: 'act-recharge-new', name: '新客储值礼', type: 'recharge', rechargeMode: 'limited', sceneCategory: 'customer_identity', status: 'running',
        start: '2026-09-10', end: '2026-10-31', description: '新客首次储值满指定金额后赠送优惠券。',
        trigger: 'recharge_payment_succeeded', triggerText: '充值支付成功并达到金额', limitText: '每人每活动 1 次',
        bundle: [], tiers: [{ amount: 100, templateId: 'tpl-recharge', qty: 1 }], triggerCount: 42, instanceCount: 39, redeemedCount: 18, usageCount: 15, gmv: 6200
      },
      {
        id: 'act-recharge-weekend', name: '周末储值加赠', type: 'recharge', rechargeMode: 'limited', sceneCategory: 'special_time', status: 'scheduled',
        start: '2026-09-19', end: '2026-09-20', description: '周末储值活动，满足金额后赠送专属优惠券。',
        trigger: 'recharge_payment_succeeded', triggerText: '充值支付成功并达到金额', limitText: '每人每活动 1 次',
        bundle: [], tiers: [{ amount: 200, templateId: 'tpl-recharge', qty: 1 }], triggerCount: 0, instanceCount: 0, redeemedCount: 0, usageCount: 0, gmv: 0
      },
      {
        id: 'act-recharge-member', name: '会员储值回馈', type: 'recharge', rechargeMode: 'regular', sceneCategory: 'customer_identity', status: 'running',
        start: '', end: '', description: '会员储值达到指定金额后获得回馈优惠券，长期有效。',
        trigger: 'recharge_payment_succeeded', triggerText: '充值支付成功并达到金额', limitText: '每人每活动 1 次',
        bundle: [], tiers: [{ amount: 800, templateId: 'tpl-recharge', qty: 1 }], triggerCount: 0, instanceCount: 0, redeemedCount: 0, usageCount: 0, gmv: 0
      },
      {
        id: 'act-recharge-national-day', name: '国庆储值礼', type: 'recharge', rechargeMode: 'limited', sceneCategory: 'special_time', status: 'scheduled',
        start: '2026-10-01', end: '2026-10-07', description: '国庆期间储值达到指定金额，赠送节日专属优惠券。',
        trigger: 'recharge_payment_succeeded', triggerText: '充值支付成功并达到金额', limitText: '每人每活动 1 次',
        bundle: [], tiers: [{ amount: 300, templateId: 'tpl-festival', qty: 1 }], triggerCount: 0, instanceCount: 0, redeemedCount: 0, usageCount: 0, gmv: 0
      },
      {
        id: 'act-recharge-midweek', name: '周中储值奖励', type: 'recharge', rechargeMode: 'limited', sceneCategory: 'special_time', status: 'ended',
        start: '2026-08-10', end: '2026-08-18', description: '周中储值达到指定金额后，自动发放回馈优惠券。',
        trigger: 'recharge_payment_succeeded', triggerText: '充值支付成功并达到金额', limitText: '每人每活动 1 次',
        bundle: [], tiers: [{ amount: 150, templateId: 'tpl-recharge', qty: 1 }], triggerCount: 63, instanceCount: 61, redeemedCount: 25, usageCount: 29, gmv: 9100
      },
      {
        id: 'act-recharge-month-end', name: '月末储值福利', type: 'recharge', rechargeMode: 'limited', sceneCategory: 'customer_behavior', status: 'running',
        start: '2026-09-25', end: '2026-09-30', description: '月末储值达到指定金额，领取当月回馈优惠券。',
        trigger: 'recharge_payment_succeeded', triggerText: '充值支付成功并达到金额', limitText: '每人每活动 2 次',
        bundle: [], tiers: [{ amount: 600, templateId: 'tpl-recharge', qty: 1 }], triggerCount: 18, instanceCount: 21, redeemedCount: 7, usageCount: 9, gmv: 4200
      },
      {
        id: 'act-recharge-new-season', name: '新赛季储值加赠', type: 'recharge', rechargeMode: 'limited', sceneCategory: 'customer_behavior', status: 'scheduled',
        start: '2026-10-08', end: '2026-11-08', description: '新赛季期间储值达到指定金额后赠送专属优惠券。',
        trigger: 'recharge_payment_succeeded', triggerText: '充值支付成功并达到金额', limitText: '不限领取次数',
        bundle: [], tiers: [{ amount: 1000, templateId: 'tpl-recharge', qty: 2 }], triggerCount: 0, instanceCount: 0, redeemedCount: 0, usageCount: 0, gmv: 0
      },
      {
        id: 'act-recharge-returning', name: '老客储值回馈', type: 'recharge', rechargeMode: 'regular', sceneCategory: 'customer_identity', status: 'offline',
        start: '', end: '', description: '面向老客的长期储值回馈活动，已暂时停用。',
        trigger: 'recharge_payment_succeeded', triggerText: '充值支付成功并达到金额', limitText: '每人每活动 1 次',
        bundle: [], tiers: [{ amount: 450, templateId: 'tpl-recharge', qty: 1 }], triggerCount: 37, instanceCount: 34, redeemedCount: 12, usageCount: 14, gmv: 7300
      },
      {
        id: 'act-claim', name: '主页领券专区', type: 'claim', sceneCategory: 'customer_behavior', status: 'scheduled',
        start: '2026-09-20', end: '2026-10-20', description: '从俱乐部主页或活动入口进入领券中心，顾客主动领取。',
        trigger: 'claim_requested', triggerText: '顾客主动点击领取', limitText: '每人每活动 1 次',
        bundle: [{ templateId: 'tpl-festival', qty: 1 }], tiers: [], triggerCount: 96, instanceCount: 73, redeemedCount: 22, usageCount: 22, gmv: 5800
      },
      {
        id: 'act-manual', name: '客服补发活动', type: 'claim', sceneCategory: 'customer_behavior', status: 'running', triggerMode: 'manual',
        start: '', end: '', description: '客服根据用户申请或服务需要，向指定用户 UID 补发关联优惠券。',
        trigger: 'manual_grant', triggerText: '管理员按用户 UID 手动发放', limitText: '按工单审核后发放',
        bundle: [{ templateId: 'tpl-threshold', qty: 1 }], tiers: [], triggerCount: 14, instanceCount: 14, redeemedCount: 0, usageCount: 0, gmv: 0
      },
      {
        id: 'act-manual-vip', name: '会员专属补发', type: 'claim', sceneCategory: 'customer_identity', status: 'scheduled', triggerMode: 'manual',
        start: '2026-09-20', end: '2026-12-31', description: '会员关怀活动按服务需要手动发放优惠券。',
        trigger: 'manual_grant', triggerText: '管理员按会员工单手动发放', limitText: '每位会员每月 1 次',
        bundle: [{ templateId: 'tpl-threshold', qty: 1 }], tiers: [], triggerCount: 0, instanceCount: 0, redeemedCount: 0, usageCount: 0, gmv: 0
      },
      {
        id: 'act-manual-festival', name: '节日客服关怀', type: 'claim', sceneCategory: 'special_time', status: 'scheduled', triggerMode: 'manual',
        start: '2026-10-01', end: '2026-10-07', description: '节日期间向关怀名单中的用户手动发放优惠券。',
        trigger: 'manual_grant', triggerText: '管理员按节日关怀名单发放', limitText: '每位用户每活动 1 次',
        bundle: [{ templateId: 'tpl-threshold', qty: 1 }], tiers: [], triggerCount: 0, instanceCount: 0, redeemedCount: 0, usageCount: 0, gmv: 0
      },
      {
        id: 'act-national-return', name: '国庆回流券', type: 'claim', sceneCategory: 'special_time', status: 'scheduled',
        start: '2026-10-01', end: '2026-10-07', description: '国庆期间面向回流顾客开放领取。',
        trigger: 'claim_requested', triggerText: '顾客主动点击领取', limitText: '每人每活动 1 次',
        bundle: [{ templateId: 'tpl-festival', qty: 1 }], tiers: [], triggerCount: 0, instanceCount: 0, redeemedCount: 0, usageCount: 0, gmv: 0
      },
      {
        id: 'act-new-weekend', name: '周末新客礼', type: 'new_customer', sceneCategory: 'special_time', status: 'running',
        start: '2026-09-12', end: '2026-09-30', description: '周末首次注册并完成首笔订单的新客可领取专属优惠券。',
        trigger: 'club_customer_qualified', triggerText: '首次成为本俱乐部新客', limitText: '每人每活动 1 次',
        bundle: [{ templateId: 'tpl-new', qty: 1 }], tiers: [], triggerCount: 58, instanceCount: 58, redeemedCount: 24, usageCount: 24, gmv: 4800
      },
      {
        id: 'act-claim-weekend', name: '周末领券专区', type: 'claim', sceneCategory: 'special_time', status: 'running',
        start: '2026-09-26', end: '2026-09-27', description: '周末活动页开放主动领券，限时领取节日优惠。',
        trigger: 'claim_requested', triggerText: '顾客主动点击领取', limitText: '每人每活动 1 次',
        bundle: [{ templateId: 'tpl-festival', qty: 1 }], tiers: [], triggerCount: 44, instanceCount: 49, redeemedCount: 16, usageCount: 16, gmv: 3200
      },
      {
        id: 'act-new-returning', name: '老客回流礼', type: 'new_customer', sceneCategory: 'customer_behavior', status: 'offline',
        start: '', end: '', description: '面向近期回流顾客的专属活动，当前已暂时停用。',
        trigger: 'club_customer_qualified', triggerText: '顾客满足回流资格', limitText: '每人每活动 1 次',
        bundle: [{ templateId: 'tpl-custom-lol', qty: 1 }], tiers: [], triggerCount: 31, instanceCount: 28, redeemedCount: 9, usageCount: 10, gmv: 2100
      },
      {
        id: 'act-claim-month', name: '月度主动领券', type: 'claim', sceneCategory: 'customer_behavior', status: 'scheduled',
        start: '2026-10-01', end: '2026-10-31', description: '顾客可在活动期间进入领券中心主动领取。',
        trigger: 'claim_requested', triggerText: '顾客主动点击领取', limitText: '不限领取次数',
        bundle: [{ templateId: 'tpl-festival', qty: 1 }], tiers: [], triggerCount: 0, instanceCount: 0, redeemedCount: 0, usageCount: 0, gmv: 0
      },
      {
        id: 'act-ended', name: '暑期充值礼', type: 'recharge', rechargeMode: 'limited', sceneCategory: 'customer_behavior', status: 'ended',
        start: '2026-07-01', end: '2026-08-31', description: '已结束活动，可复制生成新版本。',
        trigger: 'recharge_payment_succeeded', triggerText: '充值支付成功并达到档位', limitText: '每人每活动 1 次',
        bundle: [], tiers: [{ amount: 300, templateId: 'tpl-recharge', qty: 1 }], triggerCount: 134, instanceCount: 154, redeemedCount: 76, usageCount: 98, gmv: 26400
      }
    ];

    const records = [
      { id: 'GR-20260914-001', recordType: 'grant', source: 'new_customer', status: 'success', activityId: 'act-new', couponConfigId: 'coupon-001', customerId: 'CUS-10001', itemCount: 1, actualCount: 1, idempotencyKey: 'club_customer_qualified:CUS-10001', createdAt: '2026-09-14 09:21', summary: '新客首单减20 × 1', message: '发放成功，规则快照已保存。' },
      { id: 'GR-20260913-009', recordType: 'grant', source: 'manual', status: 'success', activityId: '', couponConfigId: 'coupon-004', customerId: 'CUS-10089', itemCount: 1, actualCount: 1, idempotencyKey: 'manual_grant:CUS-10089:20260913', createdAt: '2026-09-13 15:10', summary: '满500减100 × 1', message: '人工发券成功。' },
      { id: 'GR-20260912-003', recordType: 'grant', source: 'cdk', status: 'success', activityId: '', couponConfigId: 'coupon-013', customerId: 'CUS-10102', itemCount: 1, actualCount: 1, idempotencyKey: 'cdk_redeem:CDK-7F21', createdAt: '2026-09-12 11:06', summary: '全场8折券 × 1', message: 'CDK 兑换成功。' },
      { id: 'CL-20260914-021', recordType: 'claim', source: 'claim', status: 'success', activityId: 'act-claim', couponConfigId: 'coupon-003', customerId: 'CUS-10011', itemCount: 1, actualCount: 1, idempotencyKey: 'claim_requested:CUS-10011:act-claim', createdAt: '2026-09-14 10:16', summary: '周年庆立减30 × 1', message: '主动领取成功。' },
      { id: 'CL-20260914-017', recordType: 'claim', source: 'claim', status: 'failed', activityId: 'act-claim', couponConfigId: 'coupon-003', customerId: 'CUS-10037', itemCount: 0, actualCount: 0, idempotencyKey: 'claim_requested:CUS-10037:act-claim', createdAt: '2026-09-14 09:58', summary: '领取失败', message: '资格不符，未生成券实例。' },
      { id: 'US-20260914-003', recordType: 'usage', source: 'claim', status: 'consumed', activityId: 'act-claim', couponConfigId: 'coupon-003', customerId: 'CUS-10011', couponInstanceId: 'CPN-I-10021', orderId: '20260914000000000001', discount: 30, createdAt: '2026-09-14 10:43', summary: '周年庆立减30', message: '支付成功并完成核销。' },
      { id: 'US-20260913-028', recordType: 'usage', source: 'recharge', status: 'consumed', activityId: 'act-recharge', couponConfigId: 'coupon-002', customerId: 'CUS-10042', couponInstanceId: 'CPN-I-09918', orderId: '20260913000000000002', discount: 36, createdAt: '2026-09-13 19:12', summary: '全场8折券', message: '支付成功并完成核销。' },
    ];

    const coupons = [
      { id: 'CPN-I-10021', couponNo: 'CPN-I-10021', templateId: 'tpl-festival', couponConfigId: 'coupon-003', customerId: 'CUS-10011', source: 'claim', status: 'consumed', usageCount: 1, createdAt: '2026-09-14 10:16' },
      { id: 'CPN-I-09918', couponNo: 'CPN-I-09918', templateId: 'tpl-recharge', couponConfigId: 'coupon-002', customerId: 'CUS-10042', source: 'recharge', status: 'consumed', usageCount: 1, createdAt: '2026-09-13 18:42' },
      { id: 'CPN-I-09802', couponNo: 'CPN-I-09802', templateId: 'tpl-new', couponConfigId: 'coupon-001', customerId: 'CUS-10077', source: 'new_customer', status: 'available', usageCount: 0, createdAt: '2026-09-12 14:36' },
      { id: 'CPN-I-09774', couponNo: 'CPN-I-09774', templateId: 'tpl-new', couponConfigId: 'coupon-001', customerId: 'CUS-10012', source: 'new_customer', status: 'available', usageCount: 0, createdAt: '2026-09-12 11:08' },
      { id: 'CPN-I-09761', couponNo: 'CPN-I-09761', templateId: 'tpl-new', couponConfigId: 'coupon-001', customerId: 'CUS-10018', source: 'new_customer', status: 'expired', usageCount: 0, createdAt: '2026-09-02 16:20' },
      { id: 'CPN-I-09720', couponNo: 'CPN-I-09720', templateId: 'tpl-recharge', couponConfigId: 'coupon-002', customerId: 'CUS-10042', source: 'recharge', status: 'reserved', usageCount: 0, createdAt: '2026-09-13 19:02' },
      { id: 'CPN-I-09688', couponNo: 'CPN-I-09688', templateId: 'tpl-recharge', couponConfigId: 'coupon-002', customerId: 'CUS-10066', source: 'recharge', status: 'consumed', usageCount: 2, createdAt: '2026-09-11 20:14' },
      { id: 'CPN-I-09544', couponNo: 'CPN-I-09544', templateId: 'tpl-festival', couponConfigId: 'coupon-003', customerId: 'CUS-10088', source: 'claim', status: 'available', usageCount: 0, createdAt: '2026-09-14 08:32' },
      { id: 'CPN-I-09480', couponNo: 'CPN-I-09480', templateId: 'tpl-threshold', couponConfigId: 'coupon-004', customerId: 'CUS-10089', source: 'manual', status: 'available', usageCount: 0, createdAt: '2026-09-13 15:10' },
      { id: 'CPN-I-09412', couponNo: 'CPN-I-09412', templateId: 'tpl-threshold', couponConfigId: 'coupon-004', customerId: 'CUS-10102', source: 'cdk', status: 'consumed', usageCount: 1, createdAt: '2026-09-12 11:06' },
      { id: 'CPN-I-09376', couponNo: 'CPN-I-09376', templateId: 'tpl-threshold', couponConfigId: 'coupon-004', customerId: 'CUS-10116', source: 'manual', status: 'invalid', usageCount: 0, createdAt: '2026-09-10 09:48' }
    ];

    // 优惠券配置/批次与顾客券实例分离：前者进入“优惠券列表”，后者只在记录和实例明细中出现。
    const couponConfigs = [
      { id: 'coupon-001', code: 'CPN-CFG-001', name: '新客首单减20', description: '新客活动使用的优惠券配置', templateId: 'tpl-new', ruleId: 'rule-new', activityIds: ['act-new'], createdAt: '2026-08-28', updatedAt: '2026-09-14', issuedCount: 128, availableCount: 64, redeemedCount: 64, usageCount: 64, sourceSnapshot: '新客自动发', clubId: CLUB.id },
      { id: 'coupon-002', code: 'CPN-CFG-002', name: '秋季充值回馈券', description: '充值活动按最高档赠送', templateId: 'tpl-recharge', ruleId: 'rule-recharge', activityIds: ['act-recharge'], createdAt: '2026-09-01', updatedAt: '2026-09-05', issuedCount: 91, availableCount: 53, redeemedCount: 38, usageCount: 52, sourceSnapshot: '充值送券', clubId: CLUB.id },
      { id: 'coupon-003', code: 'CPN-CFG-003', name: '周年庆立减30券', description: '节日场景下主动领取的优惠券配置', templateId: 'tpl-festival', ruleId: 'rule-claim', activityIds: [], createdAt: '2026-09-08', updatedAt: '2026-09-12', issuedCount: 73, availableCount: 51, redeemedCount: 22, usageCount: 22, sourceSnapshot: '主动领取', clubId: CLUB.id },
      { id: 'coupon-004', code: 'CPN-CFG-004', name: '客服补发满500减100', description: '可复用人工发券规则的配置示例', templateId: 'tpl-threshold', ruleId: 'rule-manual', activityIds: ['act-manual'], createdAt: '2026-09-10', updatedAt: '2026-09-10', issuedCount: 14, availableCount: 14, redeemedCount: 0, usageCount: 0, sourceSnapshot: '人工发券', clubId: CLUB.id },
      { id: 'coupon-005', code: 'CPN-CFG-005', name: '新客欢迎减10', description: '新客注册后首单可使用的优惠券', templateId: 'tpl-new', ruleId: 'rule-new', activityIds: ['act-new'], createdAt: '2026-09-11', updatedAt: '2026-09-14', issuedCount: 56, availableCount: 42, redeemedCount: 14, usageCount: 14, sourceSnapshot: '新客自动发', clubId: CLUB.id },
      { id: 'coupon-006', code: 'CPN-CFG-006', name: '新客专享减30', description: '新客首单满200元立减30元', templateId: 'tpl-new', ruleId: 'rule-new', activityIds: ['act-new'], createdAt: '2026-09-12', updatedAt: '2026-09-12', issuedCount: 0, availableCount: 0, redeemedCount: 0, usageCount: 0, sourceSnapshot: '新客自动发', clubId: CLUB.id },
      { id: 'coupon-007', code: 'CPN-CFG-007', name: '充值赠15元', description: '充值达到指定档位后赠送15元优惠券', templateId: 'tpl-recharge', ruleId: 'rule-recharge', activityIds: ['act-recharge'], createdAt: '2026-09-06', updatedAt: '2026-09-13', issuedCount: 64, availableCount: 39, redeemedCount: 25, usageCount: 31, sourceSnapshot: '充值送券', clubId: CLUB.id },
      { id: 'coupon-008', code: 'CPN-CFG-008', name: '充值满300赠20', description: '单笔充值满300元赠送20元优惠券', templateId: 'tpl-recharge', ruleId: 'rule-recharge', activityIds: ['act-recharge'], createdAt: '2026-09-07', updatedAt: '2026-09-13', issuedCount: 38, availableCount: 26, redeemedCount: 12, usageCount: 16, sourceSnapshot: '充值送券', clubId: CLUB.id },
      { id: 'coupon-009', code: 'CPN-CFG-009', name: '充值回流8折券', description: '充值用户回流场景可使用的折扣券', templateId: 'tpl-discount', ruleId: 'rule-recharge', activityIds: ['act-recharge'], createdAt: '2026-08-30', updatedAt: '2026-09-10', issuedCount: 27, availableCount: 0, redeemedCount: 19, usageCount: 34, sourceSnapshot: '充值送券', clubId: CLUB.id },
      { id: 'coupon-010', code: 'CPN-CFG-010', name: '首页主动领8折', description: '顾客从首页主动领取的限时折扣券', templateId: 'tpl-discount', ruleId: 'rule-claim', activityIds: ['act-claim'], createdAt: '2026-09-09', updatedAt: '2026-09-14', issuedCount: 44, availableCount: 32, redeemedCount: 12, usageCount: 18, sourceSnapshot: '主动领取', clubId: CLUB.id },
      { id: 'coupon-011', code: 'CPN-CFG-011', name: '周年庆满200减30', description: '周年庆活动期间使用的满减优惠券', templateId: 'tpl-festival', ruleId: 'rule-claim', activityIds: ['act-claim'], createdAt: '2026-09-10', updatedAt: '2026-09-14', issuedCount: 18, availableCount: 18, redeemedCount: 0, usageCount: 0, sourceSnapshot: '主动领取', clubId: CLUB.id },
      { id: 'coupon-012', code: 'CPN-CFG-012', name: '会员关怀减20', description: '面向会员关怀活动的优惠券', templateId: 'tpl-threshold', ruleId: 'rule-manual', activityIds: ['act-manual-vip', 'act-manual-festival'], createdAt: '2026-09-11', updatedAt: '2026-09-11', issuedCount: 9, availableCount: 7, redeemedCount: 2, usageCount: 2, sourceSnapshot: '人工发券', clubId: CLUB.id },
      { id: 'coupon-013', code: 'CPN-CFG-013', name: 'CDK兑换折扣券', description: '通过兑换码发放的全场折扣券', templateId: 'tpl-discount', ruleId: 'rule-cdk', activityIds: [], createdAt: '2026-09-03', updatedAt: '2026-09-12', issuedCount: 120, availableCount: 88, redeemedCount: 32, usageCount: 45, sourceSnapshot: 'CDK兑换', clubId: CLUB.id },
      { id: 'coupon-014', code: 'CPN-CFG-014', name: '日常满100减10', description: '日常服务订单满100元可使用', templateId: 'tpl-threshold', ruleId: 'rule-manual', activityIds: [], createdAt: '2026-08-01', updatedAt: '2026-09-01', issuedCount: 35, availableCount: 0, redeemedCount: 35, usageCount: 41, sourceSnapshot: '人工发券', clubId: CLUB.id }
    ];

    templates.forEach(item => { item.clubId = CLUB.id; });
    const cdkBatches = [
      { id: 'cdk-001', name: '新客首单礼·9月批次', couponIds: ['coupon-001', 'coupon-005', 'coupon-006'], couponName: '新客首单减20、新客欢迎减10、新客专享减30', activityName: '新客首单礼', activityType: '新客活动', batchNo: 'CDK-NEW-0901', total: 500, redeemed: 312, status: 'running', createdAt: '2026-09-01', expiresAt: '2026-10-31' },
      { id: 'cdk-002', name: '周年庆回馈批次', couponIds: ['coupon-003', 'coupon-011'], couponName: '周年庆立减30券、周年庆满200减30', activityName: '主页领券专区', activityType: '主动领券', batchNo: 'CDK-FEST-0910', total: 300, redeemed: 176, status: 'running', createdAt: '2026-09-10', expiresAt: '2026-11-11' },
      { id: 'cdk-003', name: '客服服务专用批次', couponIds: ['coupon-004', 'coupon-012'], couponName: '客服补发满500减100、会员关怀减20', activityName: '客服服务活动', activityType: '手动发放', batchNo: 'CDK-CS-0908', total: 100, redeemed: 38, status: 'running', createdAt: '2026-09-08', expiresAt: '长期' },
      { id: 'cdk-004', name: '秋季回流优惠批次', couponIds: ['coupon-009'], couponName: '充值回流8折券', activityName: '老客回流礼', activityType: '自动发放', batchNo: 'CDK-RETURN-0904', total: 200, redeemed: 200, status: 'ended', createdAt: '2026-09-04', expiresAt: '2026-09-18' },
      { id: 'cdk-005', name: '国庆活动预发批次', couponIds: ['coupon-003', 'coupon-011'], couponName: '周年庆立减30券、周年庆满200减30', activityName: '国庆回流券', activityType: '主动领券', batchNo: 'CDK-ND-1001', total: 800, redeemed: 0, status: 'running', createdAt: '2026-09-14', expiresAt: '2026-10-07' },
      { id: 'cdk-006', name: '周末新客礼批次', couponIds: ['coupon-001'], couponName: '新客首单减20', activityName: '周末新客礼', activityType: '自动发放', batchNo: 'CDK-WE-0912', total: 260, redeemed: 88, status: 'running', createdAt: '2026-09-12', expiresAt: '2026-09-30' },
      { id: 'cdk-007', name: '会员专享兑换批次', couponIds: ['coupon-004'], couponName: '客服补发满500减100', activityName: '会员权益活动', activityType: 'CDK兑换', batchNo: 'CDK-VIP-0906', total: 150, redeemed: 61, status: 'paused', createdAt: '2026-09-06', expiresAt: '2026-12-31' },
      { id: 'cdk-008', name: '节日限定兑换批次', couponIds: ['coupon-003', 'coupon-011'], couponName: '周年庆立减30券、周年庆满200减30', activityName: '节日领券专区', activityType: 'CDK兑换', batchNo: 'CDK-HOLIDAY-0911', total: 600, redeemed: 427, status: 'running', createdAt: '2026-09-11', expiresAt: '2026-11-11' },
      { id: 'cdk-009', name: '老客回流试用批次', couponIds: ['coupon-006'], couponName: '新客专享减30', activityName: '老客回流礼', activityType: '自动发放', batchNo: 'CDK-RETURN-0913', total: 120, redeemed: 17, status: 'terminated', createdAt: '2026-09-13', expiresAt: '长期' },
      { id: 'cdk-010', name: '月度领券活动批次', couponIds: ['coupon-010'], couponName: '首页主动领8折', activityName: '月度主动领券', activityType: '主动领券', batchNo: 'CDK-MONTH-1001', total: 400, redeemed: 0, status: 'running', createdAt: '2026-09-14', expiresAt: '2026-10-31' },
      { id: 'cdk-011', name: '新赛季福利兑换批次', couponIds: ['coupon-013'], couponName: 'CDK兑换折扣券', activityName: '新赛季福利', activityType: 'CDK兑换', batchNo: 'CDK-SEASON-1008', total: 1000, redeemed: 0, status: 'running', createdAt: '2026-09-14', expiresAt: '2026-11-08' },
      { id: 'cdk-012', name: '夏季活动收尾批次', couponIds: ['coupon-007'], couponName: '充值赠15元', activityName: '暑期充值礼', activityType: '充值送券', batchNo: 'CDK-SUMMER-0701', total: 180, redeemed: 180, status: 'expired', createdAt: '2026-07-01', expiresAt: '2026-08-31' }
    ];

    activities.forEach(item => { item.clubId = CLUB.id; });
    cdkBatches.forEach(item => { item.clubId = CLUB.id; });
    records.forEach(item => { item.clubId = CLUB.id; });
    coupons.forEach(item => { item.clubId = CLUB.id; });
    couponConfigs.forEach(item => { item.clubId = CLUB.id; });

    return {
      club: CLUB,
      templates,
      activities,
      cdkBatches,
      records,
      coupons,
      couponConfigs,
      metrics: { trigger: 286, claim: 96, instances: 312, redeemedInstances: 142, usageCount: 173, discount: 2680, gmv: 50600 },
      ui: {
        modal: null,
        activityTab: 'overview',
        recordTab: 'grant',
        activityDraft: null,
        templateDraft: null,
        couponDraft: null,
        couponReadonly: false,
        couponReturnToDetail: false,
        associationContext: null,
        activityFilter: { q: '', status: 'all', type: 'all', trigger: 'all', duration: 'all', activityId: '' },
        activityPage: 1,
        activityPageSize: 10,
        cdkFilter: { q: '', status: 'all' },
        cdkPage: 1,
        cdkPageSize: 10,
        cdkBatchDraft: null,
        templateFilter: { q: '' },
        templatePage: 1,
        templatePageSize: 10,
        couponFilter: { q: '', templateId: 'all' },
        couponPage: 1,
        couponPageSize: 10,
        couponAdvancedExpanded: null,
        templateAdvancedExpanded: null,
        manualGrantDraft: { activityId: '', couponConfigIds: [], couponConfigId: '', couponQuantities: {}, customerId: '', quantity: 1, note: '' },
        dashboardFilter: { range: '30d', activity: 'all', activityGroup: 'all', activityType: 'all', coupon: 'all', source: 'all' },
        dashboardLastUpdated: '2026-09-14 18:00',
        dashboardActivityPage: 1,
        dashboardActivityExpanded: null,
        customerMiniTab: 'claim',
        customerRechargeSubPage: '',
        customerRechargeActivityId: '',
        customerRechargeCarouselIndex: 0,
        recordFilter: { q: '', customer: '', status: 'all', source: 'all', couponConfigId: '', activityId: '', range: '30d', dateStart: '', dateEnd: '', fromDashboard: false },
        routeViewState: {},
        modalSuppressedFor: ''
      }
    };
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }
  function money(value) { return `¥${Number(value || 0).toFixed(2)}`; }
  function int(value) { return Number(value || 0).toLocaleString('zh-CN'); }
  function num(value, fallback = 0) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
  function amountCanSplitEvenly(value, count) {
    const cents = Math.round(num(value) * 100);
    const uses = num(count, NaN);
    return Number.isSafeInteger(cents) && cents > 0 && Number.isInteger(uses) && uses >= 2 && cents % uses === 0;
  }
  function amountPerUse(value, count) { return Math.round(num(value) * 100) / num(count) / 100; }
  function getTemplate(id) { return state.templates.find(item => item.id === id); }
  function getActivity(id) { return state.activities.find(item => item.id === id); }
  function canEditActivity(activity) { return Boolean(activity && !['ended', 'offline', 'expired'].includes(activity.status)); }
  function getRecord(id) { return state.records.find(item => item.id === id); }
  function getCoupon(id) { return state.coupons.find(item => item.id === id); }
  function getCouponConfig(id) { return state.couponConfigs.find(item => item.id === id); }
  function uid(prefix) { idSeed += 1; return `${prefix}-${idSeed}`; }
  function selected(a, b) { return String(a) === String(b) ? ' selected' : ''; }
  function checked(value) { return value ? ' checked' : ''; }
  function formatDate(value) { return value ? String(value).replace(/-/g, '/') : '-'; }
  function activityTimeParts(activity) {
    return {
      start: formatDate(activity?.start) === '-' ? '长期' : formatDate(activity?.start),
      end: formatDate(activity?.end) === '-' ? '长期' : formatDate(activity?.end)
    };
  }
  function activityDurationKey(activity) {
    const time = activityTimeParts(activity);
    return time.start === '长期' && time.end === '长期' ? 'long' : 'limited';
  }
  function sourceLabel(source) { return SOURCE_LABELS[source] || source || '-'; }
  function statusLabel(status) { return STATUS_LABELS[status] || status || '-'; }
  function statusChip(status, label) { return `<span class="status ${esc(status)}"><i></i>${esc(label || statusLabel(status))}</span>`; }
  function tag(text, tone = '') { return `<span class="tag ${tone}">${esc(text)}</span>`; }
  function activityTypeLabel(activity) {
    if (!activity) return '-';
    if (activity.type === 'recharge') return ACTIVITY_TYPES.recharge;
    return ACTIVITY_TYPES[activity.type] || activity.type;
  }
  function activityTriggerMode(activity) {
    if (!activity) return 'auto';
    if (activity.triggerMode) return activity.triggerMode;
    return { recharge_payment_succeeded: 'recharge', claim_requested: 'claim', customer_claimed: 'claim', manual_grant: 'manual', cdk_redeemed: 'cdk' }[activity.trigger] || (activity.type === 'recharge' ? 'recharge' : 'auto');
  }
  function activityTriggerLabel(activity) { return ACTIVITY_TRIGGER_MODES[activityTriggerMode(activity)] || '自动发放'; }
  function activityAssociationCount(activity) { return activityTriggerMode(activity) === 'cdk' ? (activity.cdkBatchIds || []).filter(Boolean).length : activityCouponConfigs(activity).length; }
  function activitySupported(activity) { return activity?.type === 'new_customer' || activity?.type === 'recharge'; }
  function activityStatusLabel(status) { return statusLabel(status); }
  function calcTag(template) {
    return template.calcMethod === 'fixed'
      ? `<span class="rule-chip blue">${esc(template.threshold ? `满${template.threshold}减${template.amount}` : `减${template.amount}`)}</span>`
      : `<span class="rule-chip teal">${esc(`${template.discountRate / 10}折 · 封顶${template.maxDiscount}`)}</span>`;
  }
  function ruleSummary(template) {
    if (!template) return '未配置优惠券';
    return template.calcMethod === 'fixed'
      ? (Number(template.threshold) > 0 ? `满${template.threshold}减${template.amount}` : `固定减免${template.amount}元`)
      : `${Number(template.discountRate) / 10}折，封顶${template.maxDiscount}元`;
  }
  function scopeSummary(template) {
    if (!template) return '-';
    if (Array.isArray(template.scopeSelections) && template.scopeSelections.length) {
      const selections = template.scopeSelections.filter(item => item && (item.game || item.category || item.product));
      if (selections.length) return `范围：${selections.map(item => [item.game || '全部游戏', item.category || '全部分类', item.product || '全部商品'].join(' > ')).join('、')}`;
    }
    const parts = [];
    if (template.scopeGames?.length) parts.push(`游戏：${template.scopeGames.join('、')}`);
    if (template.scopeServices?.length) parts.push(`服务：${template.scopeServices.join('、')}`);
    return parts.join(' · ') || '全俱乐部';
  }
  function scopeListSummary(template) {
    if (!template) return '-';
    const selections = normalizeCouponScopeSelections(template).filter(item => item && (item.game || item.category || item.product));
    if (!selections.length) return '全部';
    return [...new Set(selections.map(item => {
      if (!item.game) return '全部';
      const path = [`游戏：${item.game}`];
      if (!item.category) return path.join(' > ');
      path.push(`项目：${item.category}`);
      if (!item.product) return path.join(' > ');
      path.push(`商品：${item.product}`);
      return path.join(' > ');
    }))].join('；');
  }

  function scopeCategoryForService(gameName, serviceName) {
    if (!serviceName) return '';
    const games = gameName ? SCOPE_CATALOG.filter(item => item.name === gameName) : SCOPE_CATALOG;
    const categories = games.flatMap(item => item.categories);
    return categories.find(category => category.name === serviceName)?.name
      || categories.find(category => serviceName === '陪玩' && category.name.includes('陪玩'))?.name
      || categories.find(category => serviceName === '陪练' && category.name.includes('陪练'))?.name
      || categories.find(category => serviceName === '代练' && category.name.includes('代练'))?.name
      || serviceName;
  }
  function legacyScopeSelections(draft) {
    const games = [...new Set((draft.scopeGames || []).filter(Boolean))];
    const services = [...new Set((draft.scopeServices || []).filter(Boolean))];
    if (!games.length && !services.length) return [{ game: '', category: '', product: '' }];
    const gameValues = games.length ? games : [''];
    const serviceValues = services.length ? services : [''];
    return gameValues.flatMap(game => serviceValues.map(service => ({
      game,
      category: scopeCategoryForService(game, service),
      product: ''
    })));
  }
  function normalizeCouponScopeSelections(draft) {
    if (Array.isArray(draft.scopeSelections) && draft.scopeSelections.length) {
      const selections = draft.scopeSelections.map(item => ({ game: item?.game || '', category: item?.category || '', product: item?.product || '' }));
      const onlyBlank = selections.length === 1 && !selections[0].game && !selections[0].category && !selections[0].product;
      if (!onlyBlank || (!(draft.scopeGames || []).length && !(draft.scopeServices || []).length)) return selections;
    }
    return legacyScopeSelections(draft);
  }

  function scopeCategoryOptions(gameName) {
    const games = gameName ? SCOPE_CATALOG.filter(item => item.name === gameName) : SCOPE_CATALOG;
    return [...new Set(games.flatMap(item => item.categories.map(category => category.name)))].map(name => ({ name }));
  }

  function scopeProductOptions(gameName, categoryName) {
    const games = gameName ? SCOPE_CATALOG.filter(item => item.name === gameName) : SCOPE_CATALOG;
    const products = games.flatMap(game => game.categories.filter(category => !categoryName || category.name === categoryName).flatMap(category => category.products));
    return [...new Set(products)];
  }

  function renderCouponScopeBuilder(draft) {
    const selections = normalizeCouponScopeSelections(draft);
    const rows = selections.map((selection, index) => {
      const hasSelection = Boolean(selection.game || selection.category || selection.product);
      const path = hasSelection ? [selection.game || '全部游戏', selection.category || '全部分类', selection.product || '全部商品'].join(' ＞ ') : '';
      const scopeOption = (field, value, label, extra = '') => `<button type="button" class="scope-menu-option${selection[field] === value ? ' active' : ''}" data-action="scope-option" data-scope-index="${index}" data-scope-field="${field}" data-scope-value="${esc(value)}"${extra}>${esc(label)}</button>`;
      const scopeNode = (field, value, label, children, searchText, extra = '') => `<div class="scope-menu-node" data-search-text="${esc(searchText)}">${scopeOption(field, value, label, extra)}${children ? `<div class="scope-submenu">${children}</div>` : ''}</div>`;
      const productButtons = (gameName, categoryName) => `<div class="scope-menu-title">商品</div>${scopeOption('product', '', '全部商品', ` data-scope-game="${esc(gameName)}" data-scope-category="${esc(categoryName)}"`)}${SCOPE_CATALOG.find(game => game.name === gameName)?.categories.find(category => category.name === categoryName)?.products.map(product => scopeOption('product', product, product, ` data-scope-game="${esc(gameName)}" data-scope-category="${esc(categoryName)}"`)).join('') || ''}`;
      const categoryNodes = game => `<div class="scope-menu-title">分类</div>${scopeOption('category', '', '全部分类', ` data-scope-game="${esc(game.name)}"`)}${game.categories.map(category => scopeNode('category', category.name, category.name, productButtons(game.name, category.name), `${game.name} ${category.name} ${category.products.join(' ')}`, ` data-scope-game="${esc(game.name)}"`)).join('')}`;
      const gameNodes = `<div class="scope-menu-title">游戏</div>${scopeOption('game', '', '全部游戏')}${SCOPE_CATALOG.map(game => scopeNode('game', game.name, game.name, categoryNodes(game), `${game.name} ${game.categories.map(category => `${category.name} ${category.products.join(' ')}`).join(' ')}`)).join('')}`;
      return `<div class="scope-row"><span class="scope-row-index">${index + 1}</span><div class="scope-cascade-picker"><div class="scope-search-box"><span class="scope-search-icon">⌕</span><input id="scope-search-${index}" data-scope-search="true" value="${esc(path)}" placeholder="全部游戏" autocomplete="off" aria-label="搜索适用范围第${index + 1}行"><span class="scope-picker-icon">⌄</span></div><input type="hidden" name="scopeGame" value="${esc(selection.game)}"><input type="hidden" name="scopeCategory" value="${esc(selection.category)}"><input type="hidden" name="scopeProduct" value="${esc(selection.product)}"><div class="scope-cascade-panel" role="listbox"><div class="scope-menu-column">${gameNodes}</div></div></div><button type="button" class="scope-remove-button" data-action="scope-remove" data-index="${index}" aria-label="删除第${index + 1}条适用范围">删除</button></div>`;
    }).join('');
    return `<div class="coupon-setting-row"><label>适用范围</label><div class="coupon-setting-control"><div class="scope-builder">${rows}</div><button type="button" class="scope-add-button" data-action="scope-add">＋ 添加适用范围</button><span class="field-hint">默认全部；点击搜索框展开菜单，可搜索并按“游戏 ＞ 分类 ＞ 商品”逐级选择。</span></div></div>`;
  }
  function validitySummary(template) {
    if (!template) return '-';
    return template.validityMode === 'relative' ? `领取后 ${template.validDays} 个自然日` : `${formatDate(template.fixedStart)}—${formatDate(template.fixedEnd)}`;
  }
  function renderCouponUserQualification(draft) {
    const options = USER_QUALIFICATION_OPTIONS.map(([value, label]) => `<option value="${value}"${selected(draft.eligibility, value)}>${label}</option>`).join('');
    return `<div class="coupon-setting-row"><label>用户资格</label><div class="coupon-setting-control"><select name="eligibility" class="coupon-qualification-select">${options}</select><span class="field-hint">当前仅首单客户为实际业务标签，其余为演示用标签，后续可接入用户标签系统。</span></div></div>`;
  }
  function eligibilitySummary(template) { return ELIGIBILITY_LABELS[template?.eligibility] || '-'; }
  function usageSummary(template) {
    if (!template) return '-';
    if (template.usageMode === 'single') return '单次使用';
    if (template.calcMethod === 'fixed') return `最多使用${Math.max(1, Math.floor(num(template.maxUses, 1)))}次 · 每次${money(num(template.amount) / Math.max(1, Math.floor(num(template.maxUses, 1))))}`;
    return `最多使用${Math.max(1, Math.floor(num(template.maxUses, 1)))}次`;
  }
  function couponTypeLabel(config, template) {
    return template?.calcMethod === 'discount' ? '折扣券' : '定额券';
  }
  function couponAmountLabel(template) {
    if (!template) return '-';
    return template.calcMethod === 'discount' ? `${Number(template.discountRate || 0).toFixed(2)}%` : money(template.amount);
  }
  function couponThresholdLabel(template) {
    return Number(template?.threshold || 0) > 0 ? money(template.threshold) : '无门槛';
  }
  function couponMaxDiscountLabel(template) {
    return template?.calcMethod === 'discount' ? money(template.maxDiscount) : '—';
  }
  function activityCouponConfigs(activity) {
    return state.couponConfigs.filter(config => (config.activityIds || []).includes(activity?.id));
  }
  function activityBundle(activity) {
    return activityCouponConfigs(activity).map(config => ({
      ...config,
      qty: 1,
      template: couponConfigTemplate(config),
      config
    }));
  }
  function activityBundleSummary(activity) {
    const items = activityBundle(activity);
    if (!items.length) return '未配置赠券';
    return items.map(item => `${item.template?.name || '未配置'} ×${item.qty}`).join('、');
  }
  function navRoute(path) {
    if (PRIMARY_ROUTES.has(path)) return path;
    if (path === 'cdk-management' || path === 'manual-grant') return 'distribution-management';
    if (path === 'activity-other') return 'activity-other';
    if (path.startsWith('activity-')) return 'activities';
    if (path.startsWith('template-')) return 'templates';
    if (path.startsWith('coupon-')) return 'coupon-form';
    return 'activities';
  }
  function parseLocation() {
    const raw = (window.location.hash || '#activities').slice(1);
    const [pathPart, queryPart = ''] = raw.split('?');
    const query = {};
    new URLSearchParams(queryPart).forEach((value, key) => { query[key] = value; });
    return { path: pathPart || 'activities', query };
  }
  function viewUnitState(path, query) {
    if (path === 'activities' || path === 'activity-other') return { tab: query.tab || (path === 'activity-other' ? 'other' : 'stored-value'), filter: state.ui.activityFilter, page: state.ui.activityPage, pageSize: state.ui.activityPageSize };
    if (path === 'distribution-management') return { tab: query.tab || 'cdk', cdkFilter: state.ui.cdkFilter, cdkPage: state.ui.cdkPage, manualDraft: state.ui.manualGrantDraft };
    if (path === 'cdk-management') return { filter: state.ui.cdkFilter, page: state.ui.cdkPage, pageSize: state.ui.cdkPageSize };
    if (path === 'templates') return { filter: state.ui.templateFilter, page: state.ui.templatePage, pageSize: state.ui.templatePageSize };
    if (path === 'coupon-form') return { filter: state.ui.couponFilter, page: state.ui.couponPage, pageSize: state.ui.couponPageSize };
    if (path === 'dashboard') return { filter: state.ui.dashboardFilter, expandedActivity: state.ui.dashboardActivityExpanded };
    if (path === 'activity-detail') return { id: query.id || '', tab: state.ui.activityTab };
    if (path === 'records') return { tab: query.tab || state.ui.recordTab, filter: state.ui.recordFilter };
    if (path === 'customer-miniapp') return {};
    if (path === 'manual-grant') return { draft: state.ui.manualGrantDraft };
    return {};
  }
  function routeViewKey() {
    const { path, query } = parseLocation();
    const normalizedQuery = Object.fromEntries(Object.entries(query).sort(([left], [right]) => left.localeCompare(right)));
    return JSON.stringify({ path, query: normalizedQuery, unit: viewUnitState(path, query) });
  }
  function beginViewSwitch() {
    const key = routeViewKey();
    rememberRouteViewState();
    state.ui.modal = null;
    state.ui.modalSuppressedFor = key;
  }
  function switchViewUnit(update) {
    beginViewSwitch();
    update();
    render();
  }
  function navigate(path, query = {}, beforeNavigate = null) {
    beginViewSwitch();
    if (beforeNavigate) beforeNavigate();
    const queryText = Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== '').map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
    const hash = `#${path}${queryText ? `?${queryText}` : ''}`;
    if (window.location.hash === hash) render(); else window.location.hash = hash;
  }
  function rememberRouteViewState() {
    const key = routeViewKey();
    state.ui.routeViewState[key] = { ...(state.ui.routeViewState[key] || {}), scrollTop: window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0, modal: clone(state.ui.modal) };
  }
  function clearCurrentRouteModal() {
    const key = routeViewKey();
    state.ui.modal = null;
    state.ui.routeViewState[key] = { ...(state.ui.routeViewState[key] || {}), modal: null };
  }
  function restoreRouteViewState(key) {
    const scrollTop = Number(state.ui.routeViewState[key]?.scrollTop);
    if (!Number.isFinite(scrollTop)) return;
    window.requestAnimationFrame(() => window.scrollTo(0, scrollTop));
  }
  function showToast(message, tone = '') {
    clearTimeout(toastTimer);
    toastNode.textContent = message;
    toastNode.className = `toast show ${tone}`.trim();
    toastTimer = setTimeout(() => { toastNode.className = 'toast'; }, 2600);
  }
  function pageHeading(kicker, title, description, actions = '') {
    if (title === '发放与核销记录') return '';
    return actions ? `<div class="page-heading page-actions-only"><div class="heading-actions">${actions}</div></div>` : '';
  }
  function couponManagementTabs(active) {
    return `<div class="coupon-management-tabs" role="tablist" aria-label="优惠券管理导航"><button type="button" class="coupon-management-tab${active === 'coupon-form' ? ' active' : ''}" role="tab" aria-selected="${active === 'coupon-form'}" data-route="coupon-form">优惠券</button><button type="button" class="coupon-management-tab${active === 'templates' ? ' active' : ''}" role="tab" aria-selected="${active === 'templates'}" data-route="templates">优惠券模板</button></div>`;
  }
  function breadcrumbLabels(path, title) {
    if (path === 'templates' || path.startsWith('template-')) return ['活动中心', '优惠券管理中心', '优惠券管理', '优惠券模板'];
  if (path === 'coupon-form') return ['活动中心', '优惠券管理中心', '优惠券管理'];
  if (path === 'coupon-create-form' || path === 'coupon-detail') return ['活动中心', '优惠券管理中心', '优惠券管理', title];
    if (path === 'activities') return ['活动中心', '活动管理中心', title];
    if (path.startsWith('activity-')) return ['活动中心', '活动管理中心', title];
    if (path === 'distribution-management' || path === 'cdk-management' || path === 'manual-grant') return ['活动中心', '发放管理中心', title];
    if (path === 'dashboard' || path === 'records') return ['活动中心', '数据与记录', title];
    if (path === 'customer-miniapp') return ['小程序端', title];
    return ['活动中心', title];
  }
  function renderBreadcrumb(path, title) {
    if (!breadcrumbNode) return;
    const labels = breadcrumbLabels(path, title);
    breadcrumbNode.innerHTML = labels.map((label, index) => `${index ? '<span class="crumb-arrow">›</span>' : ''}${index === labels.length - 1 ? `<strong>${esc(label)}</strong>` : `<span>${esc(label)}</span>`}`).join('');
  }
  function emptyState(title, description) {
    return `<div class="table-empty"><div style="font-size:28px;margin-bottom:6px;">⌁</div><strong>${esc(title)}</strong><div class="subtle" style="margin-top:4px;">${esc(description)}</div></div>`;
  }

  function renderCustomerMiniProgramPage() {
    const tab = state.ui.customerMiniTab || 'claim';
    const navItems = [['claim', '🎁', '领券中心'], ['recharge', '💰', '充值页（活动提示）'], ['checkout', '🧾', '下单结算选券']];
    const nav = navItems.map(([key, icon, label]) => `<button type="button" class="customer-miniapp-nav-item${tab === key ? ' active' : ''}" data-action="customer-miniapp-tab" data-tab="${key}"><span>${icon}</span>${label}</button>`).join('');
    const screens = { claim: renderCustomerClaimScreen(), recharge: renderCustomerRechargeScreen(), checkout: renderCustomerCheckoutScreen() };
    return `<div class="customer-miniapp-page"><aside class="customer-miniapp-nav"><div class="customer-miniapp-brand"><div class="brand-mark">星</div><div><strong>营销中心</strong><span>一期优惠券 · 顾客端</span></div></div><div class="customer-miniapp-nav-title">顾客小程序端</div>${nav}</aside><main class="customer-miniapp-content">${screens[tab] || screens.claim}</main></div>`;
  }

  function customerMiniFrame(title, module, phoneContent, notes) {
    return `<div class="customer-miniapp-heading"><div class="customer-miniapp-module">${module}</div><h1>${title}</h1><p>${title === '领券中心' ? '用户主动领券入口（本期新增用户端页面）。领取走服务端校验。' : title === '充值页（活动提示）' ? '窗口内有生效充值活动时，充值页顶部展示提示；充值成功反馈到账券。沿用现有充值入口，仅加提示条。' : '自动默认选中实际抵扣最多的一张，用户可切换/不用。每单一张。最终以服务端重算为准。'}</p></div><div class="customer-miniapp-preview"><div class="customer-miniapp-phone"><div class="customer-miniapp-phone-bar"><span>‹</span><b>${title === '下单结算 · 选券' ? '确认订单' : title.replace('（活动提示）', '')}</b></div><div class="customer-miniapp-phone-body">${phoneContent}</div></div><div class="customer-miniapp-notes"><h4>原型说明</h4><ul>${notes.map(note => `<li>${note}</li>`).join('')}</ul></div></div>`;
  }

  function renderCustomerClaimScreen() {
    const cards = [
      ['8', '折', '最高减¥50', '新人专享 8 折券', '无门槛 · 领取后 7 天有效', '限技术陪玩', '领取', ''],
      ['20', '', '满100可用', '满 100 减 20 券', '满 ¥100 · 有效期至 10-31', '全场通用', '领取', ''],
      ['30', '', '满200可用', '王者荣耀专享券', '满 ¥200 · 领取后 3 天有效', '限王者荣耀', '已领', 'got'],
      ['15', '', '首单', '首单立减券', '仅限首单 · 领取后 7 天有效', '仅首单', '领取', '']
    ];
    const couponCards = cards.map(([amount, suffix, caption, name, detail, scope, action, extra]) => `<article class="customer-coupon-card"><div class="customer-coupon-amount"><strong>${amount}<small>${suffix}</small></strong><span>${caption}</span></div><div class="customer-coupon-info"><strong>${name}</strong><span>${detail}</span><em>${scope}</em></div><button type="button" class="customer-coupon-action ${extra}" ${extra ? 'disabled' : ''} data-action="customer-claim">${action}</button></article>`).join('');
    return customerMiniFrame('领券中心', '用户端 · M2 主动领', `<div class="customer-coupon-list">${couponCards}</div>`, ['点“领取”→ 服务端校验资格/库存/每人限制/活动状态', '券面展示适用范围标签（限游戏/服务/首单）——来自 M1', '相对有效期券显示“领取后 N 天”，固定期显示具体日期', '已达每人上限 / 无库存 → 按钮置灰并给明确原因']);
  }

  function renderCustomerRechargeScreen() {
    const longTermRechargeActivities = state.activities.filter(activity => activity.type === 'recharge' && activity.status === 'running' && ((activity.start === '长期' && activity.end === '长期') || (!activity.start && !activity.end)));
    const referenceCards = longTermRechargeActivities.flatMap(activity => (activity.tiers?.length ? activity.tiers : [{ amount: 0, templateId: '' }]).map(tier => {
      const couponNames = (tier.coupons || []).map(item => `${getCouponConfig(item.couponId)?.name || getTemplate(item.templateId)?.name || '关联优惠券'}×${item.qty || 1}`).filter(Boolean);
      const gift = couponNames.length ? `送${couponNames.join('、')}` : `送${getTemplate(tier.templateId)?.name || '关联优惠券'}×${tier.qty || 1}`;
      const amount = Number(tier.amount) > 0 ? `¥${Number(tier.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}` : '长期活动';
      const claimLimit = Number(activity.perUserLimit) > 0 ? `限领${activity.perUserLimit}次` : '不限次';
      return [amount, gift, claimLimit];
    }));
    const referenceAmounts = new Set(referenceCards.map(([amount]) => Number(String(amount).replace(/[^\d.]/g, ''))));
    const rechargeAmountMocks = [[100, '送充值赠10元×1', '不限次'], [300, '送节日券×1', '不限次'], [500, '送充值赠10元×2', '不限次'], [1000, '送充值赠10元×2', '不限次'], [2000, '送会员日返现×1', '限领2次']];
    rechargeAmountMocks.forEach(([amount, gift, limit]) => {
      if (referenceCards.length < 6 && !referenceAmounts.has(amount)) {
        referenceCards.push([`¥${amount.toLocaleString('zh-CN')}.00`, gift, limit]);
        referenceAmounts.add(amount);
      }
    });
    const referenceCardHtml = referenceCards.map(([amount, gift, limit]) => `<button type="button" class="customer-reference-amount customer-account-tier-option customer-account-longterm-tier" data-action="customer-account-tier-select" data-tier-kind="longterm"><strong>${amount}</strong><span>${gift}</span><em>${limit}</em></button>`).join('');
    const localDate = new Date();
    const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
    const limitedRechargeActivities = state.activities.filter(activity => activity.type === 'recharge' && activity.start !== '长期' && activity.end !== '长期' && activity.start && activity.end && ['running', 'scheduled'].includes(activity.status) && activity.end >= today);
    const activityBanners = limitedRechargeActivities.map((activity, index) => `<button type="button" class="customer-recharge-banner" data-action="customer-recharge-activity-detail" data-id="${esc(activity.id)}" data-index="${index}"><strong>${esc(activity.name)}</strong><span>${esc(activity.rechargePromo || activity.description || '限时充值活动，充值可享专属赠券')}</span><b>›</b></button>`).join('');
    const savedActivityIndex = limitedRechargeActivities.findIndex(activity => activity.id === state.ui.customerRechargeActivityId);
    const carouselIndex = limitedRechargeActivities.length ? (savedActivityIndex >= 0 ? savedActivityIndex : ((Number(state.ui.customerRechargeCarouselIndex) || 0) % limitedRechargeActivities.length)) : 0;
    const carouselActivity = limitedRechargeActivities[carouselIndex];
    const selectedActivity = carouselActivity;
    // 顾客端预览为默认限时活动补两档演示梯度，不改后台活动配置数据。
    const selectedPreviewTiers = [...(selectedActivity?.tiers || [])];
    if (selectedActivity?.id === 'act-recharge' && selectedPreviewTiers.length === 1) {
      const baseTier = selectedPreviewTiers[0];
      [[1000, 2], [2000, 4]].forEach(([amount, multiplier]) => {
        selectedPreviewTiers.push({
          ...baseTier,
          amount,
          qty: Number(baseTier.qty || 1) * multiplier,
          coupons: (baseTier.coupons || []).map(coupon => ({ ...coupon, qty: Number(coupon.qty || 1) * multiplier }))
        });
      });
    }
    const activityPromo = selectedActivity?.rechargePromo || selectedActivity?.description || '限时充值活动，充值可享专属赠券';
    const activityTierRows = selectedPreviewTiers.map((tier, index) => {
      const coupons = (tier.coupons || []).map(item => {
        const name = getCouponConfig(item.couponId)?.name || getTemplate(item.templateId || item.couponId)?.name || '关联优惠券';
        return `${name}×${item.qty || 1}`;
      });
      if (!coupons.length && tier.templateId) coupons.push(`${getTemplate(tier.templateId)?.name || '关联优惠券'}×${tier.qty || 1}`);
      const gift = coupons.length ? `送 ${coupons.join(' + ')}` : '充值活动奖励';
      const amount = Number(tier.amount) > 0 ? Number(tier.amount) : 0;
      const claimLimit = Number(selectedActivity?.perUserLimit) > 0 ? `限领${selectedActivity.perUserLimit}次` : '不限次';
      return `<button type="button" class="customer-recharge-row${index === 0 ? ' selected' : ''}" data-action="customer-recharge-select" data-value="${amount}" data-gift="${esc(gift)}"><span><strong>¥${amount.toLocaleString('zh-CN')}</strong><em>${esc(gift)} · ${esc(claimLimit)}</em></span><i></i></button>`;
    }).join('');
    const limitedTierCards = selectedPreviewTiers.map((tier, index) => {
      const coupons = (tier.coupons || []).map(item => `${getCouponConfig(item.couponId)?.name || getTemplate(item.templateId || item.couponId)?.name || '关联优惠券'}×${item.qty || 1}`);
      if (!coupons.length && tier.templateId) coupons.push(`${getTemplate(tier.templateId)?.name || '关联优惠券'}×${tier.qty || 1}`);
      const amount = Number(tier.amount) > 0 ? Number(tier.amount) : 0;
      const gifts = coupons.length ? `赠送 ${coupons.join(' + ')}` : '充值活动赠券';
      const claimLimit = Number(selectedActivity?.perUserLimit) > 0 ? `限领${selectedActivity.perUserLimit}次` : '不限次';
      return `<button type="button" class="customer-reference-amount customer-account-tier-option customer-account-limited-tier${index === 0 ? ' selected' : ''}" data-action="customer-account-tier-select" data-tier-kind="limited"><strong>¥${amount.toLocaleString('zh-CN')}</strong><span>${esc(gifts)}</span><em>${esc(claimLimit)}</em></button>`;
    }).join('');
    const moreOffersCard = '<button type="button" class="customer-account-more-offers-card" data-action="customer-miniapp-tab" data-tab="claim"><span>查看更多</span><b>›</b></button>';
    const accountTierContent = limitedTierCards || referenceCardHtml ? `<div class="customer-reference-grid customer-account-tier-grid">${limitedTierCards}${moreOffersCard}${referenceCardHtml}</div>` : moreOffersCard;
    const selectedTier = selectedPreviewTiers.find(tier => Number(tier.amount) > 0);
    const selectedAmount = selectedTier ? Number(selectedTier.amount) : 0;
    const rechargeRows = activityTierRows || '<div class="customer-recharge-empty">暂无可参与的充值档位</div>';
    const rechargeDetail = selectedActivity ? `<div class="customer-recharge-detail-promo"><strong>${esc(selectedActivity.name)}</strong><span>${esc(activityPromo)}</span></div>` : '<div class="customer-recharge-empty">暂无可参与的限时充值活动</div>';
    const carouselSlogan = carouselActivity?.rechargePromo || carouselActivity?.description || '查看限时充值活动与专属赠券';
    const carouselControls = limitedRechargeActivities.length > 1 ? `<div class="customer-recharge-carousel-controls"><button type="button" aria-label="上一条活动" data-action="customer-recharge-carousel-step" data-step="-1">‹</button><button type="button" aria-label="下一条活动" data-action="customer-recharge-carousel-step" data-step="1">›</button></div>` : '';
    const activityEntry = `<section class="customer-recharge-carousel"><button type="button" class="customer-recharge-activity-entry" data-action="customer-recharge-activity-center" data-id="${esc(carouselActivity?.id || '')}"><span class="customer-recharge-entry-label">充值活动中心</span><strong>${esc(carouselActivity?.name || '查看限时充值活动')}</strong><span class="customer-recharge-entry-slogan">${esc(carouselSlogan)}</span><em>查看全部充值活动</em><b>›</b></button>${carouselControls}</section>`;
    const activityCenterPage = `<div class="customer-recharge-activity-page"><button type="button" class="customer-recharge-back" data-action="customer-recharge-activity-back">‹ 返回账户充值</button><h3>充值活动中心</h3><div class="customer-recharge-activity-list">${activityBanners || '<div class="customer-recharge-empty">暂无限时充值活动</div>'}</div></div>`;
    const accountContent = `<div class="customer-account-screen"><div class="customer-account-sticky-top">${activityEntry}</div><div class="customer-account-scroll"><section class="customer-balance-summary"><span>当前余额</span><strong>¥1.00</strong></section><section class="customer-reference-section customer-account-tier-section"><h3>选择充值金额</h3>${accountTierContent}</section></div><div class="customer-account-sticky-bottom"><label class="customer-agreement"><i></i>阅读并同意《充值协议》</label><button type="button" class="customer-phone-primary">确认充值</button><div class="customer-reference-mid">MID:67787</div></div></div>`;
    const referencePhone = `<div class="customer-miniapp-phone customer-reference-phone"><div class="customer-miniapp-phone-bar"><span>‹</span><b>${state.ui.customerRechargeSubPage === 'activities' ? '充值活动中心' : '账户充值'}</b></div><div class="customer-miniapp-phone-body customer-reference-body${state.ui.customerRechargeSubPage === 'activities' ? ' customer-reference-activity-body' : ''}">${state.ui.customerRechargeSubPage === 'activities' ? activityCenterPage : accountContent}</div></div>`;
    const paymentMethods = `<div class="customer-payment-methods"><button type="button" class="customer-payment-method selected" data-action="customer-payment-select" aria-pressed="true"><i class="wechat-pay-icon">微</i><span>微信支付</span><b></b></button><button type="button" class="customer-payment-method" data-action="customer-payment-select" aria-pressed="false"><i class="alipay-icon">支</i><span>支付宝支付</span><b></b></button></div>`;
    const currentPhone = `<div class="customer-miniapp-phone customer-recharge-detail-phone"><div class="customer-miniapp-phone-bar"><span>‹</span><b>充值页</b></div><div class="customer-recharge-detail-screen"><div class="customer-recharge-page-scroll"><div class="customer-recharge-detail-banners">${rechargeDetail}</div><label class="customer-phone-label">选择充值金额</label><div class="customer-recharge-list">${rechargeRows}</div></div><div class="customer-recharge-sticky-bottom"><label class="customer-phone-label customer-payment-heading">支付方式</label>${paymentMethods}<label class="customer-agreement"><i></i>阅读并同意《充值协议》</label><button type="button" class="customer-phone-primary" data-action="customer-recharge-confirm" ${selectedAmount ? '' : 'disabled'}>确认充值 ¥${selectedAmount.toLocaleString('zh-CN')}</button><div class="customer-phone-tip">充值成功后赠券自动到账</div></div></div></div>`;
    return `<div class="customer-miniapp-heading"><div class="customer-miniapp-module">用户端 · M3</div><h1>充值页（活动提示）</h1><p>按页面层级展示账户充值、充值活动中心和对应充值页。</p></div><div class="customer-recharge-dual-preview"><div>${referencePhone}<small class="customer-phone-caption">第一页 · 账户充值 / 充值活动中心</small></div><div>${currentPhone}<small class="customer-phone-caption">充值页 · 当前选中活动</small></div><div class="customer-miniapp-notes"><h4>原型说明</h4><ul><li>默认展示账户充值页和对应充值页；点击入口后在左侧查看活动列表。</li><li>选择活动后，右侧仅展示该活动宣传语、充值档位及赠券。</li></ul></div></div>`;
  }

  function renderCustomerCheckoutScreen() {
    const options = [['满 100 减 20 券', '满 ¥100 · 实际抵扣 ¥20', '20', '最优'], ['技术陪玩 8 折券', '封顶 ¥12 · 实际抵扣 ¥12', '12', ''], ['首单立减 ¥15 券', '不满足：非首单', '0', 'disabled'], ['不使用优惠券', '', '0', '']];
    const couponOptions = options.map(([name, detail, cut, state]) => `<button type="button" class="customer-checkout-option${state === '最优' ? ' selected' : ''}${state === 'disabled' ? ' disabled' : ''}" data-action="customer-checkout-select" data-cut="${cut}" data-label="${name} · -¥${cut}" ${state === 'disabled' ? 'disabled' : ''}><i></i><span><strong>${name} ${state === '最优' ? '<em>最优</em>' : ''}</strong><small>${detail}</small></span></button>`).join('');
    return customerMiniFrame('下单结算 · 选券', '用户端 · M4 最优券推荐', `<div class="customer-order-box"><div><span>技术陪玩 · 王者荣耀 · 5 局</span><b>¥150.00</b></div><div><span>优惠券</span><strong data-customer-coupon-line>满100减20券 · -¥20 ›</strong></div><div class="total"><span>合计</span><b data-customer-total>¥130.00</b></div></div><label class="customer-phone-label">可用优惠券（每单限用 1 张）</label><div class="customer-checkout-list">${couponOptions}</div>`, ['进入即默认选实际抵扣最多的一张', '折扣券抵扣受封顶金额限制，体现在实际抵扣金额中', '不满足适用范围/首单的券置灰并给原因', '金额变化后重算；提交以服务端结果为准']);
  }

  function render() {
    const { path, query } = parseLocation();
    if (path === 'template-form') {
      clearCurrentRouteModal();
      state.ui.templateDraft = null;
      navigate('templates');
      return;
    }
    const isMiniAppRoute = path === 'customer-miniapp';
    document.querySelectorAll('.surface-tab').forEach(item => item.classList.toggle('active', isMiniAppRoute && item.dataset.route === path));
    document.querySelectorAll('.surface-customer-item').forEach(item => item.classList.toggle('active', path === 'customer-miniapp' && item.dataset.tab === (state.ui.customerMiniTab || 'claim')));
    if (backendShell) backendShell.hidden = false;
    const viewKey = routeViewKey();
    if (!state.ui.modal && state.ui.routeViewState[viewKey]?.modal) state.ui.modal = clone(state.ui.routeViewState[viewKey].modal);
    if (state.ui.modal?.type === 'template-form' && getTemplate(state.ui.modal.id)?.source === 'default') {
      clearCurrentRouteModal();
      state.ui.templateDraft = null;
    }
    const route = navRoute(path);
    const templateModalOpen = state.ui.modal?.type === 'template-form';
    const activeRoute = templateModalOpen ? 'templates' : route;
    const activeNavRoute = activeRoute;
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.route === activeNavRoute));
    const title = path === 'activities' ? (query.tab === 'other' ? '常规活动' : PAGE_TITLES.activities)
      : path === 'activity-other' ? PAGE_TITLES['activity-other']
      : path === 'activity-form' ? (query.id ? '编辑活动' : '新建活动')
      : PAGE_TITLES[path] || PAGE_TITLES.activities;
    renderBreadcrumb(path, title);
    if (isMiniAppRoute) {
      appView.innerHTML = renderCustomerMiniProgramPage();
      modalRoot.innerHTML = '';
      return;
    }

    const views = {
      activities: () => renderActivities(query),
      'activity-other': () => renderActivities({ tab: 'other' }),
      'activity-form': () => renderActivityForm(query.id),
      'activity-detail': () => renderActivityDetail(query.id),
      'distribution-management': () => renderDistributionManagement(query),
      'cdk-management': () => renderDistributionManagement({ tab: 'cdk' }),
      'manual-grant': () => renderDistributionManagement({ tab: 'manual' }),
      templates: renderTemplates,
      'coupon-form': renderCoupons,
      'coupon-create-form': () => renderCouponCreateForm(query.id),
      'coupon-detail': renderCoupons,
      dashboard: renderDashboard,
      records: () => renderRecords(query.tab || state.ui.recordTab),
      'customer-miniapp': renderCustomerMiniProgramPage
    };
    appView.innerHTML = (views[path] || renderActivities)();
    if (path === 'dashboard') {
      const timePills = appView.querySelector('.dashboard-filter-main .time-pills');
      if (timePills && !timePills.querySelector('[data-value="all"]')) {
        const allButton = document.createElement('button');
        allButton.type = 'button';
        allButton.className = `time-pill${state.ui.dashboardFilter.range === 'all' ? ' active' : ''}`;
        allButton.dataset.action = 'dashboard-range';
        allButton.dataset.value = 'all';
        allButton.textContent = '全部';
          timePills.append(allButton);
      }
    }
    modalRoot.innerHTML = renderModal();
    if (state.ui.modal?.type === 'activity-detail') {
      const previewPanel = modalRoot.querySelector('.activity-detail-modal .preview-panel');
      const activity = getActivity(state.ui.modal.id);
      if (previewPanel && activity && !previewPanel.querySelector('[data-action="activity-records"]')) {
        const recordsCard = document.createElement('div');
        recordsCard.className = 'card activity-detail-records-card';
        recordsCard.innerHTML = `<button type="button" class="btn btn-secondary" data-action="activity-records" data-id="${state.ui.modal.id}" data-tab="grant">查看发放与核销记录</button>`;
        const associationCard = document.createElement('div');
        associationCard.innerHTML = renderActivityAssociationCard(activity);
        previewPanel.append(associationCard.firstElementChild, recordsCard);
      }
    }
    ensureCouponSaveActions(modalRoot);
    applyCouponReadOnlyState(modalRoot);
    restoreRouteViewState(viewKey);
  }

  function renderModalOnly() {
    const modal = document.querySelector('.coupon-create-modal');
    const modalBody = modal?.querySelector('.coupon-create-modal-body');
    if (!modalBody || state.ui.modal?.type !== 'coupon-form') { render(); return; }
    const scrollTop = modalBody.scrollTop;
    const activeId = document.activeElement?.id || '';
    const scratch = document.createElement('div');
    scratch.innerHTML = renderCouponCreateModal(state.ui.modal.id || '');
    const nextModalBody = scratch.querySelector('.coupon-create-modal-body');
    if (!nextModalBody) { render(); return; }
    modalBody.innerHTML = nextModalBody.innerHTML;
    ensureCouponSaveActions(modalBody);
    applyCouponReadOnlyState(modalBody);
    modalBody.scrollTop = scrollTop;
    if (activeId) document.getElementById(activeId)?.focus();
  }

  function renderCouponSurface() {
    if (state.ui.modal?.type === 'coupon-form') renderModalOnly(); else render();
  }

  function renderTemplateModalOnly() {
    const modal = document.querySelector('.template-modal');
    if (!modal || state.ui.modal?.type !== 'template-form') { render(); return; }
    const body = modal.querySelector('.coupon-create-modal-body');
    const scrollTop = body?.scrollTop || 0;
    const activeId = document.activeElement?.id || '';
    const scratch = document.createElement('div');
    scratch.innerHTML = renderModal();
    const nextModal = scratch.querySelector('.template-modal');
    if (!nextModal) { render(); return; }
    modal.innerHTML = nextModal.innerHTML;
    const nextBody = modal.querySelector('.coupon-create-modal-body');
    if (nextBody) nextBody.scrollTop = scrollTop;
    if (activeId) document.getElementById(activeId)?.focus();
  }

  function ensureCouponSaveActions(root) {
    const form = root?.querySelector('form[data-form="coupon-config"]');
    const actions = form?.querySelector('.form-actions');
    if (!actions) return;
    if (form.dataset.readonly === 'true') {
      actions.innerHTML = `<button type="button" class="btn btn-secondary" data-action="close-modal">取消</button><button type="button" class="btn btn-primary" data-action="coupon-enter-edit" data-id="${esc(form.dataset.id || '')}">编辑</button>`;
      return;
    }
    if (state.ui.couponReturnToDetail && form.dataset.id) {
      const cancelButton = actions.querySelector('[data-route="coupon-form"]');
      if (cancelButton) {
        cancelButton.removeAttribute('data-route');
        cancelButton.dataset.action = 'coupon-cancel-edit';
        cancelButton.dataset.id = form.dataset.id;
        cancelButton.textContent = '取消';
      }
    }
    if (actions.querySelector('[data-action="save-coupon-as-template"]')) return;
    const publishButton = actions.querySelector('[data-action="save-coupon"][data-mode="publish"]');
    if (!publishButton) return;
    const templateButton = document.createElement('button');
    templateButton.type = 'button';
    templateButton.className = 'btn btn-secondary';
    templateButton.dataset.action = 'save-coupon-as-template';
    templateButton.textContent = '另存为模板';
    actions.insertBefore(templateButton, publishButton);
    publishButton.textContent = isEditing ? '保存并生效' : '保存并发布';
  }

  function applyCouponReadOnlyState(root) {
    const form = root?.querySelector('form[data-form="coupon-config"]');
    if (!form || form.dataset.readonly !== 'true') return;
    form.classList.add('coupon-readonly-form');
    form.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(node => { node.disabled = true; });
    form.querySelectorAll('.seg-control button, .toggle-switch, .scope-cascade-trigger, .scope-add-button, .scope-remove-button, .scope-option').forEach(node => {
      node.setAttribute('aria-disabled', 'true');
      if ('disabled' in node) node.disabled = true;
    });
    const advancedToggle = form.querySelector('.advanced-toggle');
    if (advancedToggle) advancedToggle.setAttribute('aria-disabled', 'true');
  }

  function renderActivities(query = {}) {
    const isOther = query.tab === 'other';
    const filter = state.ui.activityFilter;
    const rows = state.activities.filter(item => {
      const q = filter.q.trim().toLowerCase();
      const matchesActivityType = isOther ? item.type !== 'recharge' : item.type === 'recharge';
      return matchesActivityType && (filter.duration === 'all' || activityDurationKey(item) === filter.duration) && (!isOther || filter.type === 'all' || item.type === filter.type) && (!isOther || filter.trigger === 'all' || activityTriggerMode(item) === filter.trigger) && (!q || `${item.name} ${item.id}`.toLowerCase().includes(q)) && (filter.status === 'all' || item.status === filter.status);
    });
    const pageSize = state.ui.activityPageSize || 10;
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(Math.max(1, state.ui.activityPage || 1), pageCount);
    state.ui.activityPage = page;
    const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
    const associationBanner = state.ui.associationContext?.target === 'coupon-activities' ? '<div class="info-banner association-banner"><span>↗</span><div>正在为优惠券配置选择关联活动，请点击活动行的“选择”。</div></div>' : '';
    const pagination = rows.length ? `<div class="pagination activity-pagination"><div class="pagination-pages"><button class="page-arrow" data-action="activity-page-prev" data-page="${page - 1}"${page <= 1 ? ' disabled' : ''} aria-label="上一页">‹</button>${Array.from({ length: pageCount }, (_, index) => index + 1).map(number => `<button class="page-number${number === page ? ' active' : ''}" data-action="activity-page-number" data-page="${number}"${number === page ? ' aria-current="page"' : ''}>${number}</button>`).join('')}<button class="page-arrow" data-action="activity-page-next" data-page="${page + 1}"${page >= pageCount ? ' disabled' : ''} aria-label="下一页">›</button></div><div class="pagination-summary"><span>共 ${rows.length} 条</span><span>每页显示</span><select data-filter="activity-page-size" aria-label="每页显示数量"><option value="10"${pageSize === 10 ? ' selected' : ''}>10</option><option value="20"${pageSize === 20 ? ' selected' : ''}>20</option><option value="50"${pageSize === 50 ? ' selected' : ''}>50</option></select><span>条</span></div></div>` : '';
    const title = isOther ? '常规活动' : '储值活动';
    const description = isOther ? '常规活动覆盖新客、领取等非储值业务场景。' : '储值活动负责充值成功后的优惠券发放场景。';
    const createButton = isOther ? '<button class="btn btn-primary" data-action="other-activity-create">＋ 新建活动</button>' : '<button class="btn btn-primary" data-action="activity-create">＋ 新建储值活动</button>';
    const activityDurationFilter = `<select class="filter-select" data-filter="activity-duration"><option value="all">活动时限</option><option value="long"${selected(filter.duration, 'long')}>长期</option><option value="limited"${selected(filter.duration, 'limited')}>限时</option></select>`;
    const activityTypeFilter = isOther ? `<select class="filter-select" data-filter="activity-type"><option value="all">活动类型</option>${Object.entries(ACTIVITY_TYPES).filter(([key]) => key !== 'recharge').map(([key, label]) => `<option value="${key}"${selected(filter.type, key)}>${label}</option>`).join('')}</select>` : '';
    const activityTriggerFilter = isOther ? `<select class="filter-select" data-filter="activity-trigger"><option value="all">触发方式</option>${Object.entries(ACTIVITY_TRIGGER_MODES).filter(([key]) => key !== 'recharge').map(([key, label]) => `<option value="${key}"${selected(filter.trigger, key)}>${label}</option>`).join('')}</select>` : '';
    const associationColumnTitle = isOther ? '关联优惠券/CDK' : '关联优惠券';
    const thirdColumnTitle = isOther ? '活动类型' : '充值金额';
    const emptyTitle = isOther ? '没有匹配的常规活动' : '没有匹配的储值活动';
    const emptyDescription = isOther ? '可以调整筛选条件，或等待常规活动规则开放。' : '可以调整筛选条件，或新建一个储值活动。';
    return `${pageHeading('活动中心 / 活动管理中心', title, description)}${associationBanner}
      <div class="card">
        <div class="toolbar"><div class="toolbar-left">${createButton}<form class="search-form" data-search="activities"><div class="search-box"><span class="search-icon">⌕</span><input name="q" value="${esc(filter.q)}" placeholder="搜索活动名称或 ID"></div><button class="btn btn-secondary btn-small" type="submit">查询</button></form><select class="filter-select" data-filter="activity-status"><option value="all">全部状态</option>${Object.entries({ scheduled: '未开始', running: '进行中', ended: '已结束', offline: '已停用' }).map(([key, label]) => `<option value="${key}"${selected(filter.status, key)}>${label}</option>`).join('')}</select>${activityDurationFilter}${activityTypeFilter}${activityTriggerFilter}</div><div class="toolbar-right"><span class="subtle">共 ${rows.length} 个${title}</span></div></div>
        <div class="table-wrap">${rows.length ? `<table><thead><tr><th>序号</th><th>活动名称</th>${isOther ? '<th>触发方式</th>' : ''}<th>${thirdColumnTitle}</th><th>状态</th><th>开始时间</th><th>结束时间</th><th>${associationColumnTitle}</th><th style="text-align:right;">操作</th></tr></thead><tbody>${pageRows.map((activity, index) => renderActivityRow(activity, (page - 1) * pageSize + index + 1, isOther)).join('')}</tbody></table>` : emptyState(emptyTitle, emptyDescription)}</div>${pagination}
      </div>`;
  }

  function renderActivityRow(activity, serialNumber, isOther = false) {
    const statusButton = activity.status === 'running' ? `<button class="btn-text danger" data-action="activity-stop" data-id="${activity.id}">停用</button>` : activity.status === 'offline' ? `<button class="btn-text" data-action="activity-enable" data-id="${activity.id}">启用</button>` : '';
    const deleteButton = ['ended', 'offline'].includes(activity.status) ? `<button class="btn-text muted" data-action="activity-delete" data-id="${activity.id}">删除</button>` : '';
    const associationAction = state.ui.associationContext?.target === 'coupon-activities' ? `<button class="btn-text" data-action="select-associated-activity" data-id="${activity.id}">选择</button>` : '';
    const associatedCouponCount = activityAssociationCount(activity);
    const rechargeAmount = num((activity.tiers || [])[0]?.amount);
    const rechargeAmountText = rechargeAmount > 0 ? money(rechargeAmount) : '-';
    const typeOrAmountText = isOther ? activityTypeLabel(activity) : rechargeAmountText;
    const triggerText = activityTriggerLabel(activity);
    const time = activityTimeParts(activity);
    return `<tr><td>${int(serialNumber)}</td><td><div class="primary-cell"><strong>${esc(activity.name)}</strong></div></td>${isOther ? `<td>${esc(triggerText)}</td>` : ''}<td>${esc(typeOrAmountText)}</td><td>${statusChip(activity.status)}</td><td>${esc(time.start)}</td><td>${esc(time.end)}</td><td>${int(associatedCouponCount)} 个配置</td><td><div class="action-group">${associationAction}<button class="btn-text" data-action="activity-detail" data-id="${activity.id}">详情</button><button class="btn-text" data-action="activity-copy" data-id="${activity.id}">复制并新建</button>${statusButton}${deleteButton}</div></td></tr>`;
  }

  function renderCdkManagement(options = {}) {
    const embedded = Boolean(options.embedded);
    const filter = state.ui.cdkFilter;
    const keyword = filter.q.trim().toLowerCase();
    const validStatuses = ['running', 'paused', 'ended', 'terminated', 'expired'];
    if (filter.status !== 'all' && !validStatuses.includes(filter.status)) filter.status = 'all';
    const rows = state.cdkBatches.filter(batch => {
      const text = `${batch.name} ${batch.batchNo} ${batch.couponName} ${batch.activityName}`.toLowerCase();
      return (!keyword || text.includes(keyword)) && (filter.status === 'all' || batch.status === filter.status);
    });
    const pageSize = state.ui.cdkPageSize || 10;
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(Math.max(1, state.ui.cdkPage || 1), pageCount);
    state.ui.cdkPage = page;
    const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
    const pagination = rows.length ? `<div class="pagination cdk-pagination"><div class="pagination-pages"><button class="page-arrow" data-action="cdk-page-prev" data-page="${page - 1}"${page <= 1 ? ' disabled' : ''} aria-label="上一页">‹</button>${Array.from({ length: pageCount }, (_, index) => index + 1).map(number => `<button class="page-number${number === page ? ' active' : ''}" data-action="cdk-page-number" data-page="${number}"${number === page ? ' aria-current="page"' : ''}>${number}</button>`).join('')}<button class="page-arrow" data-action="cdk-page-next" data-page="${page + 1}"${page >= pageCount ? ' disabled' : ''} aria-label="下一页">›</button></div><div class="pagination-summary"><span>共 ${rows.length} 条</span><span>每页显示</span><select data-filter="cdk-page-size" aria-label="每页显示数量"><option value="10"${pageSize === 10 ? ' selected' : ''}>10</option><option value="20"${pageSize === 20 ? ' selected' : ''}>20</option><option value="50"${pageSize === 50 ? ' selected' : ''}>50</option></select><span>条</span></div></div>` : '';
    const content = `<div class="card cdk-management-card"><div class="toolbar"><div class="toolbar-left"><button class="btn btn-primary" data-action="cdk-batch-create">＋ 新建CDK批次</button><form class="search-form" data-search="cdk"><div class="search-box"><span class="search-icon">⌕</span><input name="q" value="${esc(filter.q)}" placeholder="搜索批次名称、编号或活动"></div><button class="btn btn-secondary btn-small" type="submit">查询</button></form><select class="filter-select" data-filter="cdk-status"><option value="all">全部状态</option><option value="running"${selected(filter.status, 'running')}>进行中</option><option value="paused"${selected(filter.status, 'paused')}>已暂停</option><option value="ended"${selected(filter.status, 'ended')}>已结束</option><option value="terminated"${selected(filter.status, 'terminated')}>已终止</option><option value="expired"${selected(filter.status, 'expired')}>已过期</option></select></div><div class="toolbar-right"><span class="subtle">共 ${rows.length} 个 CDK 批次</span></div></div><div class="table-wrap">${rows.length ? `<table><thead><tr><th>序号</th><th>批次名称</th><th>关联优惠券</th><th>关联活动</th><th>码模式</th><th>批次编号</th><th>核销进度</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead><tbody>${pageRows.map((batch, index) => renderCdkBatchRow(batch, (page - 1) * pageSize + index + 1)).join('')}</tbody></table>` : emptyState('没有匹配的 CDK 批次', '可以调整搜索词或状态筛选。')}</div>${pagination}</div>`;
    return embedded ? content : `${pageHeading('活动中心 / 发放管理中心', 'CDK管理', '管理兑换码批次及其发放状态。')}${content}`;
  }

  function renderManualGrantPage(options = {}) {
    const embedded = Boolean(options.embedded);
    const manualActivities = state.activities.filter(activity => activityTriggerMode(activity) === 'manual' && activity.status === 'running');
    const draft = state.ui.manualGrantDraft || { activityId: '', couponConfigIds: [], couponConfigId: '', couponQuantities: {}, customerId: '', quantity: 1, note: '' };
    const selectedActivityId = manualActivities.some(activity => activity.id === draft.activityId) ? draft.activityId : (manualActivities[0]?.id || '');
    const selectedActivity = getActivity(selectedActivityId);
    const availableConfigs = state.couponConfigs.filter(config => (config.activityIds || []).includes(selectedActivityId));
    const draftCouponIds = Array.isArray(draft.couponConfigIds) ? draft.couponConfigIds : (draft.couponConfigId ? [draft.couponConfigId] : []);
    const selectedCouponIds = [...new Set(draftCouponIds.filter(couponId => availableConfigs.some(config => config.id === couponId)))];
    if (!selectedCouponIds.length && availableConfigs[0]) selectedCouponIds.push(availableConfigs[0].id);
    const selectedConfigs = selectedCouponIds.map(couponId => getCouponConfig(couponId)).filter(Boolean);
    const quantityByCoupon = draft.couponQuantities && typeof draft.couponQuantities === 'object' ? draft.couponQuantities : {};
    const couponRows = selectedCouponIds.map((selectedId, index) => {
      const rowOptions = availableConfigs.filter(config => config.id === selectedId || !selectedCouponIds.includes(config.id));
      const config = availableConfigs.find(item => item.id === selectedId);
      const availableCount = Math.max(0, Math.floor(num(config?.availableCount, 0)));
      const quantity = Math.max(1, Math.min(99, Math.floor(num(quantityByCoupon[selectedId], 1))));
      return `<div class="manual-grant-coupon-row"><select name="couponConfigIds" aria-label="优惠券配置">${rowOptions.map(config => `<option value="${esc(config.id)}"${selected(selectedId, config.id)}>${esc(config.name)}</option>`).join('')}</select><div class="manual-grant-quantity"><input type="number" min="1" max="${Math.min(99, availableCount)}" step="1" name="couponQuantities" data-coupon-id="${esc(selectedId)}" value="${quantity}" aria-label="${esc(config?.name || '优惠券')}发放数量"><span>张 / 库存 ${int(availableCount)} 张</span></div>${selectedCouponIds.length > 1 ? `<button type="button" class="btn-text danger" data-action="manual-grant-remove-coupon" data-index="${index}">删除</button>` : ''}</div>`;
    }).join('');
    const selectedSummary = selectedConfigs.length ? `<div class="manual-selected-config manual-selected-config-multi">${selectedConfigs.map(config => { const template = couponConfigTemplate(config); return `<div class="manual-selected-config-item"><strong>${esc(config.name)}</strong><span>当前规则：${esc(ruleSummary(template))}</span><span>关联活动：${esc(selectedActivity?.name || '无关联活动')}</span><span>可用库存：${int(config.availableCount)} 张</span></div>`; }).join('')}</div>` : '<div class="manual-selected-config is-empty">请先选择当前活动已关联的优惠券配置。</div>';
    const activityOptions = manualActivities.length
      ? manualActivities.map(activity => `<option value="${esc(activity.id)}"${selected(selectedActivityId, activity.id)}>${esc(activity.name)}</option>`).join('')
      : '<option value="">暂无进行中的手动发放活动</option>';
    const couponSelector = availableConfigs.length ? `${couponRows}<button type="button" class="btn-text manual-grant-add-coupon" data-action="manual-grant-add-coupon"${selectedCouponIds.length >= availableConfigs.length ? ' disabled' : ''}>＋ 再加一种券</button>` : '<div class="manual-selected-config is-empty">当前活动暂无已发布的关联优惠券</div>';
    const allQuantitiesValid = selectedConfigs.length > 0 && selectedConfigs.every(config => {
      const quantity = Math.floor(num(quantityByCoupon[config.id], 1));
      return quantity >= 1 && quantity <= 99 && quantity <= Math.max(0, num(config.availableCount));
    });
    const content = `<div class="manual-grant-page"><div class="manual-grant-layout"><section class="card manual-grant-card"><div class="card-head"><div><h3>手动发放优惠券</h3><p>先选择进行中的手动发放活动，再从该活动已关联的优惠券中选择发放配置。</p></div>${tag('人工发券', 'blue')}</div><form data-form="manual-grant-page" class="manual-grant-page-form"><div class="field manual-grant-field-full"><label>用户 UID<em>*</em></label><input name="customerId" value="${esc(draft.customerId)}" placeholder="例如：CUS-10089" autocomplete="off"></div><div class="field manual-grant-field-full"><label>关联活动<em>*</em></label><select name="activityId">${activityOptions}</select><span class="field-hint">仅展示状态为“进行中”且触发方式配置为“手动发放”的活动。</span></div><div class="field manual-grant-field-full"><label>优惠券配置与发放数量<em>*</em></label><div class="manual-grant-coupon-list">${couponSelector}</div><span class="field-hint">每种优惠券分别填写发放数量；提交时逐种校验库存，不能重复选择同一种券。</span></div><div class="manual-grant-field-full">${selectedSummary}</div><div class="field manual-grant-field-full"><label>发放备注</label><textarea name="note" placeholder="可填写补发原因、客服工单号或业务说明">${esc(draft.note)}</textarea></div><div class="notice manual-grant-notice manual-grant-field-full"><span>i</span><div>提交后会按每种优惠券填写的数量分别生成顾客券实例，并从对应可用库存中扣减；任一券库存不足时不能发放。</div></div><div class="manual-grant-actions manual-grant-field-full"><button type="submit" class="btn btn-primary"${allQuantitiesValid ? '' : ' disabled'}>确认发放</button></div></form></section><aside class="card manual-grant-guide"><div class="card-body"><div class="section-title"><span></span><h3>操作说明</h3></div><ol class="manual-grant-steps"><li><strong>选择关联活动</strong><span>仅展示状态为“进行中”且触发方式配置为“手动发放”的活动。</span></li><li><strong>选择优惠券和数量</strong><span>优惠券列表只来自当前活动的已关联配置，可添加多种券；每种券单独填写发放数量。</span></li><li><strong>填写 UID</strong><span>UID 作为顾客券实例的归属标识。</span></li><li><strong>确认发放</strong><span>逐种校验库存，发放成功后自动扣减对应库存。</span></li></ol></div></aside></div></div>`;
    return embedded ? content : `${pageHeading('活动中心 / 发放管理中心', '手动发放', '将优惠券发放至指定用户 UID。')}${content}`;
  }

  function renderDistributionManagement(query = {}) {
    const tab = query.tab === 'manual' ? 'manual' : 'cdk';
    const tabItems = [['cdk', 'CDK管理'], ['manual', '手动发放']];
    const content = tab === 'manual' ? renderManualGrantPage({ embedded: true }) : renderCdkManagement({ embedded: true });
    return `<div class="distribution-management-page"><div class="coupon-management-tabs distribution-management-tabs" role="tablist" aria-label="发放管理中心导航">${tabItems.map(([key, label]) => `<button type="button" class="coupon-management-tab${tab === key ? ' active' : ''}" role="tab" aria-selected="${tab === key}" data-action="distribution-tab" data-tab="${key}">${label}</button>`).join('')}</div><div class="distribution-tab-panel">${content}</div></div>`;
  }

  function renderCdkBatchRow(batch, serialNumber) {
    const remaining = Math.max(0, num(batch.total) - num(batch.redeemed));
    const progress = num(batch.total) > 0 ? Math.min(100, Math.round((num(batch.redeemed) / num(batch.total)) * 100)) : 0;
    const canPause = batch.status === 'running';
    const canResume = batch.status === 'paused';
    const canTerminate = !['ended', 'terminated', 'expired'].includes(batch.status);
    return `<tr><td>${int(serialNumber)}</td><td><div class="primary-cell"><strong>${esc(batch.name)}</strong><small>${esc(batch.batchNo)}</small></div></td><td>${esc(batch.couponName)}</td><td>${esc(batch.activityName)}</td><td>${esc(batch.codeMode || (batch.activityType === 'CDK兑换' ? '唯一码' : '共享码'))}</td><td><span class="mono-text">${esc(batch.batchNo)}</span></td><td><div class="cdk-progress"><div class="cdk-progress-track"><i style="width:${progress}%;"></i></div><strong>${progress}%</strong><small>${int(batch.redeemed)} / ${int(batch.total)}</small></div></td><td>${statusChip(batch.status)}</td><td>${esc(formatDate(batch.createdAt))}</td><td><div class="action-group cdk-action-group"><button class="btn-text" data-action="cdk-detail" data-id="${esc(batch.id)}">详情</button><button class="btn-text" data-action="cdk-export" data-id="${esc(batch.id)}">导出码列表</button>${canResume ? `<button class="btn-text" data-action="cdk-resume" data-id="${esc(batch.id)}">恢复发放</button>` : `<button class="btn-text" data-action="cdk-pause" data-id="${esc(batch.id)}"${canPause ? '' : ' disabled'}>暂停发放</button>`}<button class="btn-text danger" data-action="cdk-terminate" data-id="${esc(batch.id)}"${canTerminate ? '' : ' disabled'}>终止批次</button></div></td></tr>`;
  }

  function renderCdkDetailModal(id) {
    const batch = state.cdkBatches.find(item => item.id === id);
    if (!batch) return '';
    const remaining = Math.max(0, num(batch.total) - num(batch.redeemed));
    const progress = num(batch.total) > 0 ? Math.min(100, Math.round((num(batch.redeemed) / num(batch.total)) * 100)) : 0;
    const coupons = (batch.couponIds || []).map(couponId => getCouponConfig(couponId)).filter(Boolean);
    const couponLinks = coupons.length ? coupons.map(coupon => `<button type="button" class="cdk-coupon-link" data-action="coupon-detail" data-id="${esc(coupon.id)}"><span>${esc(coupon.name)}</span><small>${esc(coupon.code)}</small><b>查看详情 →</b></button>`).join('') : `<span>${esc(batch.couponName || '暂无关联优惠券')}</span>`;
    return `<div class="modal-backdrop modal-centered"><div class="confirm-card cdk-detail-modal"><div class="drawer-head"><div><span class="section-kicker">CDK管理</span><h2>${esc(batch.name)}</h2><p>${esc(batch.batchNo)} · ${esc(batch.activityName)}</p></div><button class="close-button" data-action="close-modal" aria-label="关闭">×</button></div><div class="definition-list" style="grid-template-columns:1fr;margin-top:14px;"><div class="definition-item cdk-detail-coupons"><b>关联优惠券</b><div class="cdk-coupon-links">${couponLinks}</div></div><div class="definition-item"><b>关联活动</b><span>${esc(batch.activityName)}</span></div><div class="definition-item"><b>码模式</b><span>${esc(batch.codeMode || (batch.activityType === 'CDK兑换' ? '唯一码' : '共享码'))}</span></div><div class="definition-item"><b>批次状态</b><span>${statusChip(batch.status)}</span></div><div class="definition-item"><b>核销进度</b><span>${progress}%（${int(batch.redeemed)} / ${int(batch.total)}，剩余 ${int(remaining)}）</span></div><div class="definition-item"><b>创建时间</b><span>${esc(formatDate(batch.createdAt))}</span></div><div class="definition-item"><b>有效期至</b><span>${esc(batch.expiresAt === '长期' ? '长期' : formatDate(batch.expiresAt))}</span></div></div><div class="confirm-actions"><button class="btn btn-primary btn-small" data-action="close-modal">知道了</button></div></div></div>`;
  }

  function blankCdkBatchDraft() {
    const defaultCoupon = state.couponConfigs[0];
    return { name: '', category: 'activity', codeMode: 'shared', specifiedCode: '', totalRedeem: 1, validStart: '', validEnd: '', couponIds: defaultCoupon ? [defaultCoupon.id] : [] };
  }
  function collectCdkBatchDraft(form) {
    const fd = new FormData(form);
    const current = clone(state.ui.cdkBatchDraft || blankCdkBatchDraft());
    const couponIds = fd.getAll('couponIds').map(value => String(value || ''));
    const codeMode = String(fd.get('codeMode') || 'shared');
    return { ...current, name: String(fd.get('name') || '').trim(), category: String(fd.get('category') || ''), codeMode, specifiedCode: codeMode === 'shared' ? String(fd.get('specifiedCode') || '').trim() : '', totalRedeem: Math.floor(num(fd.get('totalRedeem'), 0)), validStart: String(fd.get('validStart') || ''), validEnd: String(fd.get('validEnd') || ''), couponIds: couponIds.length ? couponIds : (current.couponIds || []) };
  }
  function validateCdkBatch(draft) {
    if (!draft.name) return '请填写批次名称';
    if (!draft.category) return '请选择批次类别';
    if (!['shared', 'unique'].includes(draft.codeMode)) return '请选择码模式';
    if (draft.totalRedeem < 1) return '总可核销次数至少为 1 次';
    if (!draft.validStart || !draft.validEnd) return '请选择生效开始日期和生效截止日期';
    if (draft.validStart > draft.validEnd) return '生效开始日期不能晚于生效截止日期';
    const couponIds = (draft.couponIds || []).filter(Boolean);
    if (!couponIds.length || couponIds.some(couponId => !getCouponConfig(couponId))) return '请至少选择一张关联券';
    return '';
  }
  function saveCdkBatch() {
    const form = document.querySelector('form[data-form="cdk-batch"]');
    if (!form) return;
    const draft = collectCdkBatchDraft(form);
    const error = validateCdkBatch(draft);
    if (error) { showToast(error, 'error'); return; }
    const coupons = draft.couponIds.map(couponId => getCouponConfig(couponId)).filter(Boolean);
    const couponNames = coupons.map(coupon => coupon.name);
    const id = uid('cdk');
    state.cdkBatches.unshift({ id, name: draft.name, couponIds: coupons.map(coupon => coupon.id), couponNames, couponName: couponNames.join('、'), activityName: '待关联活动', activityType: 'CDK兑换', batchNo: `CDK-NEW-${String(idSeed).padStart(4, '0')}`, total: draft.totalRedeem, redeemed: 0, status: 'running', createdAt: DEMO_TODAY, expiresAt: draft.validEnd.slice(0, 10), codeMode: draft.codeMode === 'unique' ? '唯一码' : '共享码', specifiedCode: draft.specifiedCode, category: draft.category, validStart: draft.validStart, validEnd: draft.validEnd, clubId: CLUB.id });
    state.ui.cdkBatchDraft = null;
    clearCurrentRouteModal();
    showToast('CDK批次已创建并开始运行', 'success');
    render();
  }
  function renderCdkBatchForm() {
    const draft = { ...blankCdkBatchDraft(), ...(state.ui.cdkBatchDraft || {}) };
    state.ui.cdkBatchDraft = draft;
    const categoryOptions = [['activity', '活动兑换码'], ['member', '会员专属码']];
    const codeModeOptions = [['shared', '共享码'], ['unique', '唯一码']];
    const couponCatalog = state.couponConfigs;
    const specifiedCodeField = draft.codeMode === 'shared' ? `<div class="field"><label>指定码</label><input name="specifiedCode" value="${esc(draft.specifiedCode)}" placeholder="请输入指定码（选填）" maxlength="80"><span class="field-hint">不填写时由系统自动生成共享码。</span></div>` : '';
    const selectedCouponIds = Array.isArray(draft.couponIds) && draft.couponIds.length ? draft.couponIds : [''];
    const couponRows = selectedCouponIds.map((couponId, index) => `<div class="cdk-coupon-row"><select name="couponIds" aria-label="关联券"><option value="">请选择关联券</option>${couponCatalog.map(coupon => `<option value="${esc(coupon.id)}"${selected(couponId, coupon.id)}>${esc(coupon.name)} · ${esc(coupon.code)}</option>`).join('')}</select>${index > 0 ? `<button type="button" class="btn-text danger" data-action="cdk-remove-coupon" data-index="${index}">删除</button>` : ''}</div>`).join('');
    return `<div class="modal-backdrop modal-centered"><div class="confirm-card cdk-batch-form-modal" role="dialog" aria-modal="true" aria-labelledby="cdk-batch-form-title"><div class="drawer-head"><div><span class="section-kicker">活动中心 / 活动管理中心 / CDK管理</span><h2 id="cdk-batch-form-title">新建CDK批次</h2><p>配置批次规则、核销次数、生效时间与关联券。</p></div><button class="close-button" data-action="close-modal" aria-label="关闭">×</button></div><form data-form="cdk-batch" class="cdk-batch-form"><div class="field"><label>批次名称<em>*</em></label><input name="name" value="${esc(draft.name)}" placeholder="请输入批次名称" maxlength="40"></div><div class="field"><label>批次类别<em>*</em></label><select name="category">${categoryOptions.map(([key, label]) => `<option value="${key}"${selected(draft.category, key)}>${label}</option>`).join('')}</select></div><div class="field"><label>码模式<em>*</em></label><select name="codeMode">${codeModeOptions.map(([key, label]) => `<option value="${key}"${selected(draft.codeMode, key)}>${label}</option>`).join('')}</select></div>${specifiedCodeField}<div class="field"><label>总可核销次数<em>*</em></label><div class="activity-stepper"><button type="button" class="activity-stepper-button" data-action="cdk-adjust-number" data-step="-1" aria-label="减少总可核销次数">−</button><input type="number" name="totalRedeem" min="1" step="1" value="${Math.max(1, Number(draft.totalRedeem) || 1)}"><button type="button" class="activity-stepper-button" data-action="cdk-adjust-number" data-step="1" aria-label="增加总可核销次数">＋</button><span>次</span></div></div><div class="cdk-validity-range"><div class="field"><label>生效开始日期<em>*</em></label><input type="datetime-local" name="validStart" value="${esc(draft.validStart)}"></div><span class="cdk-validity-separator" aria-hidden="true">至</span><div class="field"><label>生效截止日期<em>*</em></label><input type="datetime-local" name="validEnd" value="${esc(draft.validEnd)}"></div></div><div class="field cdk-batch-form-full"><label>关联券<em>*</em></label><div class="cdk-coupon-list">${couponRows}</div><button type="button" class="btn-text cdk-add-coupon" data-action="cdk-add-coupon">＋ 再加一张券</button><span class="field-hint">批次兑换成功后，将按配置发放所关联的优惠券。</span></div><div class="form-actions cdk-batch-form-actions"><button type="button" class="btn btn-secondary" data-action="close-modal">取消</button><button type="submit" class="btn btn-primary">保存批次</button></div></form></div></div>`;
  }

  function blankActivityDraft() {
    return { id: '', name: '', type: 'new_customer', triggerMode: 'auto', rechargeMode: 'regular', sceneCategory: 'customer_identity', start: '长期', end: '长期', description: '', showInRechargeCenter: false, rechargePromo: '', limitText: '每人每活动 1 次', qualificationKey: 'all', qualification: '全部顾客', couponIds: [], couponQuantities: [], couponClaimIds: [], couponClaimLimits: [], couponClaimCustomized: false, cdkBatchIds: [], perUserLimit: 0, totalLimit: 0, bundle: [{ templateId: 'tpl-new', qty: 1 }], tiers: [{ amount: 100, templateId: 'tpl-recharge', qty: 1, coupons: [{ couponId: '', qty: 1 }], claimCoupons: [{ couponId: '', limit: 1 }] }] };
  }
  function activityDraftFor(id) {
    let draft;
    const pendingDraft = state.ui.activityDraft;
    if (pendingDraft && (!id || pendingDraft.id === id)) {
      draft = clone(pendingDraft);
    }
    if (!draft && id) {
      const activity = getActivity(id);
      if (activity) draft = clone(activity);
    }
    if (!draft) draft = clone(state.ui.activityDraft && !state.ui.activityDraft.id ? state.ui.activityDraft : blankActivityDraft());
    const linked = id ? activityCouponConfigs({ id }) : [];
    const fallbackQualification = draft.sceneCategory === 'customer_identity' ? 'new_user' : 'all';
    const linkedIds = linked.map(config => config.id);
    const resolvedCouponIds = Array.isArray(draft.couponIds) ? draft.couponIds : linkedIds;
    const hasClaimIds = Array.isArray(draft.couponClaimIds);
    const fallbackClaimIds = resolvedCouponIds.filter(Boolean);
    return { ...draft, triggerMode: draft.triggerMode || (draft.type === 'recharge' ? 'recharge' : 'auto'), qualificationKey: draft.qualificationKey || fallbackQualification, qualification: draft.qualification || (draft.qualificationKey === 'new_user' || fallbackQualification === 'new_user' ? '新用户' : '全部顾客'), couponIds: resolvedCouponIds, couponQuantities: Array.isArray(draft.couponQuantities) && draft.couponQuantities.length ? draft.couponQuantities : linked.map(() => 100), couponClaimIds: hasClaimIds ? draft.couponClaimIds : fallbackClaimIds, couponClaimLimits: Array.isArray(draft.couponClaimLimits) && draft.couponClaimLimits.length ? draft.couponClaimLimits : fallbackClaimIds.map(() => 1), perUserLimit: Number.isFinite(Number(draft.perUserLimit)) ? Number(draft.perUserLimit) : 0, totalLimit: Number.isFinite(Number(draft.totalLimit)) ? Number(draft.totalLimit) : 0, limitReceive: draft.limitReceive === true || Number(draft.perUserLimit) > 0 };
  }
  function renderActivityAssociationEditor(draft, id) {
    const configs = id ? activityCouponConfigs({ id }) : [];
const linked = configs.length ? configs.map(config => `<div class="association-item"><span class="coupon-icon">券</span><div><strong>${esc(config.name)}</strong><small>${esc(config.code)}</small></div><button type="button" class="btn-text" data-action="coupon-edit" data-id="${config.id}">编辑</button></div>`).join('') : '<span class="muted">暂未关联优惠券配置</span>';
    return `<div class="section-block"><h2 class="form-section-title">关联优惠券配置</h2><p class="form-section-desc">活动只负责生效时间和业务场景；优惠券配置负责优惠规则。</p><div class="association-list">${linked}</div>${id ? '<button type="button" class="btn btn-secondary btn-small" style="margin-top:13px;" data-action="associate-coupons-from-activity" data-id="' + id + '">跳转优惠券列表选择</button>' : ''}</div>`;
  }
  function activityTierCoupons(tier, fallbackCouponId = '') {
    const fallbackQty = Number.isFinite(Number(tier?.qty)) ? Number(tier.qty) : 1;
    const source = Array.isArray(tier?.coupons) && tier.coupons.length ? tier.coupons : tier?.couponId ? [{ couponId: tier.couponId, qty: fallbackQty }] : [{ couponId: fallbackCouponId || '', qty: fallbackQty }];
    return source.map(item => ({ couponId: item.couponId || item.id || '', qty: Math.max(0, Math.min(9999, Math.floor(num(item.qty, fallbackQty)))) }));
  }
  function activityTierClaimCoupons(tier, upperCoupons = activityTierCoupons(tier)) {
    const upperIds = new Set(upperCoupons.map(item => item.couponId).filter(Boolean));
    const source = Array.isArray(tier?.claimCoupons) && tier.claimCoupons.length ? tier.claimCoupons : upperCoupons.map(item => ({ couponId: item.couponId, limit: 1 }));
    const rows = source.filter(item => !item.couponId || upperIds.has(item.couponId)).map(item => ({ couponId: item.couponId || '', limit: Math.max(1, Math.min(9999, Math.floor(num(item.limit, 1)))) }));
    return rows.length ? rows : [{ couponId: '', limit: 1 }];
  }
  function renderRechargeTierCouponRows(tier, tierIndex, couponCatalog) {
    const coupons = activityTierCoupons(tier);
    const selectedIds = new Set(coupons.map(item => item.couponId).filter(Boolean));
    return coupons.map((coupon, couponIndex) => `<div class="rule-coupon-row"><select name="tierCouponIds" data-tier-index="${tierIndex}" data-coupon-index="${couponIndex}" aria-label="第${tierIndex + 1}个充值梯度第${couponIndex + 1}张关联优惠券"><option value="">请选择优惠券</option>${couponCatalog.filter(config => config.id === coupon.couponId || !selectedIds.has(config.id)).map(config => `<option value="${esc(config.id)}"${selected(coupon.couponId, config.id)}>${esc(config.name)}</option>`).join('')}</select><span class="rule-times">×</span><div class="activity-stepper rule-coupon-stepper"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="tierCouponQuantity" data-tier-index="${tierIndex}" data-coupon-index="${couponIndex}" data-step="-1" aria-label="减少第${tierIndex + 1}个充值梯度第${couponIndex + 1}张发放数量">−</button><input type="number" min="0" max="9999" step="1" name="tierCouponQuantities" data-tier-index="${tierIndex}" data-coupon-index="${couponIndex}" value="${coupon.qty}" aria-label="第${tierIndex + 1}个充值梯度第${couponIndex + 1}张发放数量"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="tierCouponQuantity" data-tier-index="${tierIndex}" data-coupon-index="${couponIndex}" data-step="1" aria-label="增加第${tierIndex + 1}个充值梯度第${couponIndex + 1}张发放数量">＋</button><span class="rule-suffix">张</span></div>${couponIndex > 0 ? `<button type="button" class="btn-text danger" data-action="activity-remove-tier-coupon" data-tier-index="${tierIndex}" data-coupon-index="${couponIndex}">删除</button>` : ''}</div>`).join('');
  }
  function renderRechargeTierClaimRows(tier, tierIndex, couponCatalog, upperCoupons = activityTierCoupons(tier)) {
    const claimCoupons = activityTierClaimCoupons(tier, upperCoupons);
    const upperIds = new Set(upperCoupons.map(item => item.couponId).filter(Boolean));
    const selectedIds = new Set(claimCoupons.map(item => item.couponId).filter(Boolean));
    const rows = claimCoupons.map((coupon, couponIndex) => `<div class="rule-coupon-row"><select name="tierClaimCouponIds" data-tier-index="${tierIndex}" data-coupon-index="${couponIndex}" aria-label="第${tierIndex + 1}个充值梯度第${couponIndex + 1}张单次最多领取优惠券"><option value="">请选择优惠券</option>${[...upperIds].filter(couponId => couponId === coupon.couponId || !selectedIds.has(couponId)).map(couponId => { const config = couponCatalog.find(item => item.id === couponId); return config ? `<option value="${esc(config.id)}"${selected(coupon.couponId, config.id)}>${esc(config.name)}</option>` : ''; }).join('')}</select><span class="rule-times">×</span><div class="activity-stepper rule-coupon-stepper"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="tierClaimLimit" data-tier-index="${tierIndex}" data-coupon-index="${couponIndex}" data-step="-1" aria-label="减少第${tierIndex + 1}个充值梯度第${couponIndex + 1}张单次最多领取数量">−</button><input type="number" min="1" max="9999" step="1" name="tierClaimLimits" data-tier-index="${tierIndex}" data-coupon-index="${couponIndex}" value="${coupon.limit}" aria-label="第${tierIndex + 1}个充值梯度第${couponIndex + 1}张单次最多领取数量"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="tierClaimLimit" data-tier-index="${tierIndex}" data-coupon-index="${couponIndex}" data-step="1" aria-label="增加第${tierIndex + 1}个充值梯度第${couponIndex + 1}张单次最多领取数量">＋</button><span class="rule-suffix">张</span></div>${couponIndex > 0 ? `<button type="button" class="btn-text danger" data-action="activity-remove-tier-claim-coupon" data-tier-index="${tierIndex}" data-coupon-index="${couponIndex}">删除</button>` : ''}</div>`).join('');
    const canAdd = upperIds.size > selectedIds.size;
    return `${rows}<button type="button" class="btn-text rule-add-coupon activity-add-tier-coupon" data-action="activity-add-tier-claim-coupon" data-tier-index="${tierIndex}"${canAdd ? '' : ' disabled'}>＋ 再加一种券</button>`;
  }
  function renderActivityForm(id, variant = 'stored') {
    const draft = activityDraftFor(id);
    if (draft.type !== 'recharge' && draft.triggerMode !== 'cdk' && draft.couponClaimCustomized !== true && Array.isArray(draft.couponIds)) {
      const defaultClaimIds = draft.couponIds.filter(Boolean);
      const previousClaimLimits = new Map((draft.couponClaimIds || []).filter(Boolean).map((couponId, index) => [couponId, Math.max(1, Math.min(9999, Math.floor(num(draft.couponClaimLimits?.[index], 1))))]));
      draft.couponClaimIds = defaultClaimIds;
      draft.couponClaimLimits = defaultClaimIds.map(couponId => previousClaimLimits.get(couponId) || 1);
    }
    state.ui.activityDraft = draft;
    const isEdit = Boolean(id);
    const existingActivity = isEdit ? getActivity(id) : null;
    const isPublishedEdit = Boolean(existingActivity);
    const isOtherCreate = variant === 'other' && !isEdit;
    const isOtherForm = variant === 'other' || (isEdit && draft.type !== 'recharge');
    const associatedCount = id ? activityCouponConfigs({ id }).length : 0;
    const qualificationOptions = [['new_user', '新用户'], ['all', '全部顾客'], ['segment', '指定人群包（待确认）']];
    const qualificationKey = draft.qualificationKey || (draft.sceneCategory === 'customer_identity' ? 'new_user' : 'all');
    const activityTypeOptions = Object.entries(ACTIVITY_TYPES).filter(([key]) => !isOtherForm || key !== 'recharge');
    const activityTypeField = isOtherForm ? `<select name="type" aria-label="活动类型">${activityTypeOptions.map(([key, label]) => `<option value="${key}"${selected(draft.type, key)}>${label}</option>`).join('')}</select>` : `<div class="readonly-field"><span class="source-dot"></span>${esc(activityTypeLabel(draft))}<span class="field-hint">储值活动类型由系统默认设置</span></div>`;
    const triggerMode = draft.triggerMode || (isOtherForm ? 'auto' : 'recharge');
    const triggerOptions = isOtherForm ? [['auto', '自动发放'], ['claim', '主动领取'], ['manual', '手动发放'], ['cdk', 'CDK兑换'], ['recharge', '充值送券']] : [['recharge', '充值送券'], ['auto', '自动发放'], ['claim', '主动领取'], ['manual', '手动发放'], ['cdk', 'CDK兑换']];
    const triggerField = triggerOptions.map(([key, label]) => `<button type="button" class="rule-source-button${triggerMode === key ? ' active' : ''}"${triggerMode === key ? ' aria-current="true"' : ''}${isOtherForm && key === 'recharge' ? ' disabled' : ''}${isOtherForm && key !== 'recharge' ? ` data-action="activity-trigger" data-value="${key}"` : ''}>${label}</button>`).join('');
    const couponCatalog = state.couponConfigs;
    const defaultCoupon = couponCatalog.find(config => config.templateId === 'tpl-recharge') || couponCatalog[0];
    const isLongTerm = draft.start === '长期' && draft.end === '长期';
    const selectedCouponIds = (Array.isArray(draft.couponIds) ? draft.couponIds : (!id && isOtherForm ? [''] : (!id && defaultCoupon ? [defaultCoupon.id] : []))).slice(0, isLongTerm && !isOtherForm ? 1 : undefined);
    const associatedCouponIds = selectedCouponIds.filter(Boolean);
    const rawClaimCouponIds = Array.isArray(draft.couponClaimIds) ? draft.couponClaimIds : associatedCouponIds;
    const filteredClaimCouponIds = rawClaimCouponIds.filter(couponId => !couponId || associatedCouponIds.includes(couponId));
    const claimCouponIds = Array.isArray(draft.couponClaimIds) ? filteredClaimCouponIds : (filteredClaimCouponIds.length ? filteredClaimCouponIds : ['']);
    const claimSelectedIds = claimCouponIds.filter(Boolean);
    const claimAddDisabled = !associatedCouponIds.length || associatedCouponIds.every(couponId => claimSelectedIds.includes(couponId));
    const previewCouponCount = selectedCouponIds.filter(Boolean).length;
    const associationQuantities = selectedCouponIds.map((_, index) => Math.max(0, Math.min(9999, Math.floor(num(draft.couponQuantities?.[index], 100)))));
    const claimLimitQuantities = claimCouponIds.map((_, index) => Math.max(1, Math.min(9999, Math.floor(num(draft.couponClaimLimits?.[index], 1)))));
    const couponRows = selectedCouponIds.map((couponId, index) => {
      const quantity = associationQuantities[index];
      return `<div class="rule-coupon-row"><select name="couponIds" class="activity-coupon-select${couponId ? '' : ' activity-select-empty'}" aria-label="赠送优惠券"><option value=""${selected(couponId, '')}>请选择优惠券</option>${couponCatalog.filter(coupon => coupon.id === couponId || !selectedCouponIds.includes(coupon.id)).map(coupon => `<option value="${esc(coupon.id)}"${selected(couponId, coupon.id)}>${esc(coupon.name)}</option>`).join('')}</select><span class="rule-times">×</span><div class="activity-stepper rule-coupon-stepper"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="couponQuantity" data-index="${index}" data-step="-1" aria-label="减少第${index + 1}个优惠券发放数量">−</button><input type="number" min="0" max="9999" step="1" name="couponQuantities" value="${quantity}" aria-label="赠送数量"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="couponQuantity" data-index="${index}" data-step="1" aria-label="增加第${index + 1}个优惠券发放数量">＋</button><span class="rule-suffix">张</span></div>${isLongTerm && !isOtherForm ? '' : `<button type="button" class="btn-text danger" data-action="activity-remove-coupon" data-index="${index}">删除</button>`}</div>`;
    }).join('');
    const cdkBatchCatalog = state.cdkBatches.filter(batch => batch.status === 'running');
    const selectedCdkBatchId = Array.isArray(draft.cdkBatchIds) && draft.cdkBatchIds.length ? draft.cdkBatchIds[0] : (!id ? cdkBatchCatalog[0]?.id || '' : '');
    const cdkBatchField = `<div class="rule-coupon-list"><select name="cdkBatchIds" aria-label="关联CDK批次">${cdkBatchCatalog.length ? cdkBatchCatalog.map(batch => `<option value="${esc(batch.id)}"${selected(selectedCdkBatchId, batch.id)}>${esc(batch.name)} · ${esc(batch.batchNo)}</option>`).join('') : '<option value="">暂无可关联的CDK批次</option>'}</select></div><span class="field-hint">CDK兑换触发时，使用已生成的兑换码批次发放优惠券。</span>`;
    const isCdkTrigger = triggerMode === 'cdk';
    const associationLabel = isCdkTrigger ? '关联CDK批次' : '关联优惠券与发放总量';
    const associationHint = isCdkTrigger ? '' : '<span class="field-hint activity-coupon-total-hint">数量为 0 时，无限发放。</span>';
    const associationRows = isCdkTrigger ? cdkBatchField : couponRows;
    const associationCount = isCdkTrigger ? (selectedCdkBatchId ? 1 : 0) : previewCouponCount;
    const claimCouponRows = claimCouponIds.map((couponId, index) => { const quantity = claimLimitQuantities[index]; const selectedClaimIds = new Set(claimCouponIds.filter(Boolean)); return `<div class="rule-coupon-row"><select name="couponClaimIds" class="activity-coupon-select${couponId ? '' : ' activity-select-empty'}" aria-label="单次最多领取优惠券"><option value=""${selected(couponId, '')}>请选择优惠券</option>${associatedCouponIds.filter(associatedId => associatedId === couponId || !selectedClaimIds.has(associatedId)).map(associatedId => { const coupon = couponCatalog.find(config => config.id === associatedId); return coupon ? `<option value="${esc(coupon.id)}"${selected(couponId, coupon.id)}>${esc(coupon.name)}</option>` : ''; }).join('')}</select><span class="rule-times">×</span><div class="activity-stepper rule-coupon-stepper"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="couponClaimLimit" data-index="${index}" data-step="-1" aria-label="减少第${index + 1}个单次最多领取数量">−</button><input type="number" min="1" max="9999" step="1" name="couponClaimLimits" value="${quantity}" aria-label="单次最多领取数量"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="couponClaimLimit" data-index="${index}" data-step="1" aria-label="增加第${index + 1}个单次最多领取数量">＋</button><span class="rule-suffix">张</span></div><button type="button" class="btn-text danger" data-action="activity-remove-claim-coupon" data-index="${index}">删除</button></div>`; }).join('');
    const singleClaimField = isOtherForm && !isCdkTrigger ? `<div class="field activity-single-claim-field"><label>单次最多领取<em>*</em></label><div class="rule-coupon-list">${claimCouponRows || '<span class="muted">请添加可领取的优惠券</span>'}</div><button type="button" class="btn-text rule-add-coupon" data-action="activity-add-claim-coupon"${claimAddDisabled ? ' disabled' : ''}>＋ 再加一种券</button><span class="field-hint">默认跟随“关联优惠券与发放总量”，也可选择部分券种并设置客户单次最多领取数量；可全部删除，但保存前必须至少保留一张。</span></div>` : '';
    const rechargeTiers = isOtherForm ? [] : ((draft.tiers || []).length ? draft.tiers : [{ amount: '', templateId: 'tpl-recharge', qty: 1 }]).slice(0, isLongTerm ? 1 : undefined).map((tier, index) => { const coupons = selectedCouponIds.map((couponId, couponIndex) => ({ couponId, qty: associationQuantities[couponIndex] ?? 0 })); return { ...tier, coupons, claimCoupons: activityTierClaimCoupons(tier, coupons), qty: Number(tier.qty || draft.couponQuantities?.[index] || 1) }; });
    const rechargeTierSummary = rechargeTiers.map(tier => num(tier.amount, 0) ? money(tier.amount) : '未填写').join('、') || '—';
    const rechargeTiersField = isOtherForm ? '' : `<div class="activity-tier-section"><div class="activity-tier-section-head"><div><h3>充值梯度</h3><p>按用户单笔充值金额匹配对应梯度，并按梯度限制单次领取内容。</p></div></div><div class="activity-tier-list">${rechargeTiers.map((tier, index) => `<div class="activity-tier-card"><div class="activity-tier-head"><strong>梯度 ${index + 1}</strong>${!isLongTerm && rechargeTiers.length > 1 ? `<button type="button" class="btn-text danger" data-action="activity-remove-tier" data-index="${index}">删除梯度</button>` : ''}</div><div class="activity-tier-grid recharge-tier-grid"><div class="field"><label>充值金额<em>*</em></label><div class="activity-stepper"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="tierAmount" data-index="${index}" data-step="-0.01" aria-label="减少第${index + 1}个充值梯度金额">−</button><input type="number" min="0.01" step="0.01" name="tierAmounts" value="${tier.amount || ''}" placeholder="请输入充值金额"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="tierAmount" data-index="${index}" data-step="0.01" aria-label="增加第${index + 1}个充值梯度金额">＋</button><span>元</span></div></div><div class="field tier-coupon-field"><label>单次最多领取<em>*</em></label><div class="activity-tier-coupon-list">${renderRechargeTierClaimRows(tier, index, couponCatalog, tier.coupons)}</div>${isLongTerm ? '' : '<span class="field-hint">内容跟随活动关联优惠券，可按本充值梯度选择券种及数量。</span>'}</div></div></div>`).join('')}</div>${isLongTerm ? '' : '<button type="button" class="btn-text rule-add-coupon activity-add-tier" data-action="activity-add-tier">＋ 新增充值梯度</button>'}</div>`;
    const associationField = `<div class="field activity-coupon-field"><label>${associationLabel}<em>*</em></label>${associationHint}${associationRows || '<div class="rule-coupon-list"><span class="muted">暂无可选优惠券配置</span></div>'}${isCdkTrigger || (isLongTerm && !isOtherForm) ? '' : '<button type="button" class="btn-text rule-add-coupon" data-action="activity-add-coupon">＋ 再加一种券</button>'}</div>${singleClaimField}${isOtherForm ? '' : rechargeTiersField}`;
    const triggerLabel = ACTIVITY_TRIGGER_MODES[triggerMode] || ACTIVITY_TRIGGER_MODES.auto;
    const limitReceive = draft.limitReceive === true || Number(draft.perUserLimit) > 0;
    const activityTimeSummary = draft.start === '长期' && draft.end === '长期' ? '长期' : `${formatDate(draft.start)} 至 ${formatDate(draft.end)}`;
    const qualificationSummary = qualificationOptions.find(item => item[0] === qualificationKey)?.[1] || draft.qualification || '全部顾客';
    const formHeader = '';
    const cancelButton = '<button type="button" class="btn btn-secondary" data-action="close-modal">取消</button>';
    const activityPrimaryLabel = isPublishedEdit ? '保存活动' : '发布活动';
    const activityTimeField = (startValue, endValue) => { const isLongTerm = startValue === '长期' && endValue === '长期'; return `<div class="activity-time-field"><div class="activity-time-control"><label class="activity-long-term-switch"><span class="rule-switch"><input type="checkbox" data-activity-time-long-term${isLongTerm ? ' checked' : ''} aria-label="活动时间选择长期"><span></span></span><span>长期</span></label><span class="activity-time-divider" aria-hidden="true"></span><input type="date"${isLongTerm ? '' : ' name="start"'} value="${isLongTerm ? '' : esc(startValue || '')}"${isLongTerm ? ' disabled' : ''} aria-label="活动开始日期"> <span class="activity-time-range-separator" aria-hidden="true">至</span><input type="date"${isLongTerm ? '' : ' name="end"'} value="${isLongTerm ? '' : esc(endValue || '')}"${isLongTerm ? ' disabled' : ''} aria-label="活动结束日期">${isLongTerm ? '<input type="hidden" name="start" value="长期"><input type="hidden" name="end" value="长期">' : ''}</div></div>`; };
    const activityLimitField = limitReceive ? `<div class="field rule-limit-field activity-limit-count"><label>限制参加次数</label><div class="activity-stepper"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="perUserLimit" data-step="-1" aria-label="减少限制参加次数">−</button><input type="number" min="1" name="perUserLimit" value="${Number(draft.perUserLimit) > 0 ? Number(draft.perUserLimit) : ''}" placeholder="请输入限制参加次数"><button type="button" class="activity-stepper-button" data-action="activity-adjust-number" data-field="perUserLimit" data-step="1" aria-label="增加限制参加次数">＋</button><span>次</span></div><span class="field-hint">同一顾客参与本活动的累计参加次数。</span></div>` : '';
    const rechargeCenterField = !isLongTerm ? `<div class="activity-recharge-center-field"><div class="rule-switch-line"><strong>是否展示在充值中心</strong><label class="rule-switch"><input type="checkbox" name="showInRechargeCenter"${draft.showInRechargeCenter ? ' checked' : ''}><span></span></label></div>${draft.showInRechargeCenter ? `<div class="field activity-promo-field"><label>活动宣传语<em>*</em></label><input name="rechargePromo" maxlength="20" value="${esc(draft.rechargePromo || '')}" placeholder="请输入 20 字以内的活动宣传语"><span class="field-hint">用于充值中心活动提示，最多 20 个字。</span></div>` : '<span class="field-hint">仅限时活动可配置，开启后将在充值中心展示活动宣传语。</span>'}</div>` : '';
    const formContent = `${formHeader}
      <div class="split-layout activity-form-layout"><div class="card activity-form-card"><form data-form="activity" data-id="${esc(id || '')}">
        <div class="card-body">${isOtherForm ? '' : `<input type="hidden" name="type" value="${esc(draft.type)}">`}<input type="hidden" name="rechargeMode" value="${esc(draft.rechargeMode || 'regular')}">
        <div class="section-block"><h2 class="form-section-title">基本信息</h2><p class="form-section-desc">先填写活动名称和活动说明，再配置活动规则。</p><div class="form-grid">
          <div class="field"><label>活动名称<em>*</em></label><input name="name" value="${esc(draft.name)}" placeholder="例如：新客首单礼" maxlength="30"><span class="field-hint">建议使用顾客能理解的活动名称。</span></div>
          <div class="field"><label>活动类型</label>${activityTypeField}</div>
          <div class="field full"><label>活动说明</label><textarea name="description" placeholder="说明活动面向谁、希望达成什么目标">${esc(draft.description)}</textarea></div>
        </div></div>
        <div class="section-block"><h2 class="form-section-title">规则信息</h2><div class="field"><label>触发方式<em>*</em></label><input type="hidden" name="triggerMode" value="${esc(triggerMode)}"><div class="rule-source-control activity-trigger-options">${triggerField}</div><span class="field-hint">${isOtherForm ? '当前支持自动发放、主动领取、手动发放和CDK兑换；充值送券暂不支持。' : '当前为充值发放场景，触发方式固定为充值送券；其他方式暂未开放。'}</span></div><div class="activity-time-block"><label class="activity-time-label">活动时间<em>*</em></label><div class="activity-time-grid">${activityTimeField(draft.start, draft.end)}</div><span class="field-hint activity-time-hint">不限时活动请将开始时间和结束时间都设为“长期”。</span></div>${rechargeCenterField}<div class="field"><label>目标资格<em>*</em></label><select name="qualificationKey">${qualificationOptions.map(item => `<option value="${item[0]}"${selected(qualificationKey, item[0])}>${item[1]}</option>`).join('')}</select><span class="field-hint">资格判断面向顾客身份，不依靠 member_id 区分。</span></div></div>
        <div class="section-block"><h2 class="form-section-title">发放内容</h2>${associationField}<div class="field rule-limit-field"><label>限制参加</label><div class="rule-switch-line activity-limit-switch"><strong>${limitReceive ? '限制参加次数' : '不限参加次数'}</strong><label class="rule-switch"><input type="checkbox" name="limitReceive"${limitReceive ? ' checked' : ''}><span></span></label></div></div>${activityLimitField}</div>
        <div class="form-actions">${cancelButton}<button type="button" class="btn btn-primary" data-action="save-activity">${activityPrimaryLabel}</button></div>
      </div></form></div>
      <aside class="preview-panel"><div class="card preview-card"><div class="preview-label">活动配置预览</div><div class="preview-title">${esc(draft.name || '未命名活动')}</div><div class="preview-divider"></div><div class="preview-row"><span>活动类型</span><strong>${esc(activityTypeLabel(draft))}</strong></div><div class="preview-row"><span>触发方式</span><strong>${esc(triggerLabel)}</strong></div><div class="preview-row"><span>活动时间</span><strong>${esc(activityTimeSummary)}</strong></div>${isOtherForm ? '' : `<div class="preview-row"><span>充值梯度</span><strong>${esc(rechargeTierSummary)}</strong></div>`}<div class="preview-row"><span>${associationLabel}</span><strong>${associationCount} 个配置</strong></div><div class="preview-row"><span>目标资格</span><strong>${esc(qualificationSummary)}</strong></div><div class="preview-row"><span>限制参加</span><strong>${limitReceive ? `每人 ${Number(draft.perUserLimit) || 0} 次` : '不限次数'}</strong></div></div></aside></div>`;
    const modalTitle = isEdit ? (isOtherForm ? '编辑活动' : '编辑储值活动') : isOtherCreate ? '新建活动' : '新建储值活动';
    const modalDescription = isEdit ? `${isOtherForm ? '修改活动类型、触发方式、活动时间与关联内容。' : '修改活动时间、充值金额与关联优惠券。'}保存后仅影响后续券发放，已发布券实例不受影响。` : isOtherCreate ? '配置活动时间、触发方式与关联优惠券。' : '配置充值成功后的活动时间、充值金额与关联优惠券。';
    return `<div class="modal-backdrop modal-centered activity-create-backdrop"><div class="coupon-create-modal activity-create-modal" role="dialog" aria-modal="true" aria-labelledby="activity-create-modal-title"><div class="coupon-create-modal-head"><div><span class="section-kicker">活动中心 / 活动管理中心</span><h2 id="activity-create-modal-title">${modalTitle}</h2><p>${modalDescription}</p></div><button type="button" class="close-button" data-action="close-modal" aria-label="关闭">×</button></div><div class="activity-create-modal-body">${formContent}</div></div></div>`;
  }

  function renderActivityDetail(id) {
    const activity = getActivity(id);
    if (!activity) return `${pageHeading('活动中心 / 活动管理中心', '活动不存在', '当前链接没有找到对应活动。', '<button class="btn btn-secondary" data-route="activities">返回列表</button>')}`;
    const tab = state.ui.activityTab;
    const tabContent = tab === 'config' ? renderActivityConfig(activity) : tab === 'records' ? renderActivityRecords(activity) : renderActivityOverview(activity);
    return `<div class="detail-top"><div><button class="back-link" data-route="activities">‹ 返回活动列表</button><div class="detail-title"><h1>${esc(activity.name)}</h1>${statusChip(activity.status)}</div><div class="subtle" style="margin-top:7px;">${esc(activity.id)} · ${esc(activityTypeLabel(activity))} · ${esc(ACTIVITY_SCENES[activity.sceneCategory])}</div></div><div class="detail-actions"><button class="btn btn-secondary btn-small" data-action="activity-copy" data-id="${activity.id}">复制并新建</button>${canEditActivity(activity) ? `<button class="btn btn-secondary btn-small" data-action="activity-edit" data-id="${activity.id}">编辑</button>` : ''}${activity.status === 'running' ? `<button class="btn btn-danger btn-small" data-action="activity-stop" data-id="${activity.id}">停用活动</button>` : activity.status === 'offline' ? `<button class="btn btn-secondary btn-small" data-action="activity-enable" data-id="${activity.id}">启用活动</button>` : ''}</div></div>
      <div class="detail-tabs">${[['overview', '概览'], ['config', '配置'], ['records', '记录']].map(([key, label]) => `<button class="detail-tab${tab === key ? ' active' : ''}" data-action="activity-detail-tab" data-tab="${key}">${label}</button>`).join('')}</div>${tabContent}`;
  }
  function renderActivityDetailModal(id) {
    const activity = getActivity(id);
    if (!activity) return '';
    const configs = activityCouponConfigs(activity);
    const time = activityTimeParts(activity);
    const isLongTerm = (!activity.start && !activity.end) || (activity.start === '长期' && activity.end === '长期');
    const isOtherActivity = activity.type !== 'recharge';
    const triggerMode = activityTriggerMode(activity);
    const isCdkTrigger = triggerMode === 'cdk';
    const limitText = String(activity.limitText || '');
    const limitMatch = limitText.match(/(\d+)/);
    const limitReceive = activity.limitReceive === true || Number(activity.perUserLimit) > 0 || (Boolean(limitMatch) && !limitText.includes('不限'));
    const limitCount = Number(activity.perUserLimit) > 0 ? Number(activity.perUserLimit) : (limitMatch ? Number(limitMatch[1]) : 0);
    const qualification = activity.qualification || (activity.sceneCategory === 'customer_identity' ? '新用户' : '全部顾客');
    const couponRows = configs.length ? configs.map((config, index) => `<div class="rule-coupon-row"><select disabled aria-label="赠送优惠券"><option>${esc(config.name)}</option></select><span class="rule-times">×</span><input type="number" value="${activity.couponQuantities?.[index] ?? config.qty ?? 100}" disabled aria-label="赠送数量"><span class="rule-suffix">张</span></div>`).join('') : '<span class="muted">暂无可选优惠券配置</span>';
    const claimCouponIds = Array.isArray(activity.couponClaimIds) ? activity.couponClaimIds : configs.map(config => config.id);
    const claimConfigs = claimCouponIds.map(couponId => configs.find(config => config.id === couponId)).filter(Boolean);
    const claimLimitRows = claimConfigs.length ? claimConfigs.map((config, index) => `<div class="rule-coupon-row"><div class="activity-claim-coupon-readonly" aria-label="单次最多领取优惠券">${esc(config.name)}</div><span class="rule-times">×</span><input type="number" value="${activity.couponClaimLimits?.[index] ?? 1}" disabled aria-label="单次最多领取数量"><span class="rule-suffix">张</span></div>`).join('') : '<span class="muted">暂无可选优惠券配置</span>';
    const cdkBatches = (activity.cdkBatchIds || []).map(batchId => state.cdkBatches.find(batch => batch.id === batchId)).filter(Boolean);
    const cdkRows = cdkBatches.length ? cdkBatches.map(batch => `<div class="rule-coupon-row"><select disabled aria-label="关联CDK批次"><option>${esc(batch.name)} · ${esc(batch.batchNo)}</option></select></div>`).join('') : '<span class="muted">暂无可关联的CDK批次</span>';
    const associationLabel = isCdkTrigger ? '关联CDK批次' : '关联优惠券与发放总量';
    const associationRows = isCdkTrigger ? cdkRows : couponRows;
    const associationCount = isCdkTrigger ? cdkBatches.length : configs.length;
    const claimLimitField = isOtherActivity && !isCdkTrigger && claimConfigs.length ? `<div class="field activity-single-claim-field"><label>单次最多领取</label><div class="rule-coupon-list">${claimLimitRows}</div><span class="field-hint">优惠券内容跟随“关联优惠券与发放总量”，仅可调整单次最多领取数量。</span></div>` : '';
    const triggerOptions = isOtherActivity ? [['auto', '自动发放'], ['claim', '主动领取'], ['manual', '手动发放'], ['cdk', 'CDK兑换'], ['recharge', '充值送券']] : [['recharge', '充值送券'], ['auto', '自动发放'], ['claim', '主动领取'], ['manual', '手动发放'], ['cdk', 'CDK兑换']];
    const triggerButtons = triggerOptions.map(([key, label]) => `<button type="button" class="rule-source-button${triggerMode === key ? ' active' : ''}"${triggerMode === key ? ' aria-current="true"' : ''}${(isOtherActivity && key === 'recharge') || (!isOtherActivity && key !== 'recharge') ? ' disabled' : ''}>${label}</button>`).join('');
    const triggerHint = isOtherActivity ? '当前支持自动发放、主动领取、手动发放和CDK兑换；充值送券暂不支持。' : '当前为充值发放场景，触发方式固定为充值送券；其他方式暂未开放。';
    const rechargeUpperCoupons = configs.map((config, index) => ({ couponId: config.id, qty: activity.couponQuantities?.[index] ?? config.qty ?? 100 }));
    const rechargeTiers = isOtherActivity ? [] : ((activity.tiers || []).length ? activity.tiers : [{ amount: 0, templateId: 'tpl-recharge', qty: 1 }]).map(tier => ({ ...tier, coupons: rechargeUpperCoupons, claimCoupons: activityTierClaimCoupons(tier, rechargeUpperCoupons) }));
    const rechargeTierRows = rechargeTiers.map((tier, index) => { const tierClaimRows = tier.claimCoupons.map(coupon => { const config = getCouponConfig(coupon.couponId) || configs.find(item => item.id === coupon.couponId); return `<div class="rule-coupon-row"><select disabled aria-label="单次最多领取优惠券"><option>${esc(config?.name || '未关联优惠券')}</option></select><span class="rule-times">×</span><input type="number" value="${coupon.limit}" disabled aria-label="单次最多领取数量"><span class="rule-suffix">张</span></div>`; }).join(''); return `<div class="activity-tier-card activity-tier-card-readonly"><div class="activity-tier-head"><strong>梯度 ${index + 1}</strong></div><div class="activity-tier-grid recharge-tier-grid"><div class="field"><label>充值金额</label><div class="activity-stepper"><button type="button" class="activity-stepper-button" disabled>−</button><input type="number" value="${num(tier.amount, 0)}" disabled><button type="button" class="activity-stepper-button" disabled>＋</button><span>元</span></div></div><div class="field tier-coupon-field"><label>单次最多领取</label><div class="activity-tier-coupon-list">${tierClaimRows}</div></div></div></div>`; }).join('');
    const rechargeTierSummary = rechargeTiers.map(tier => num(tier.amount, 0) ? money(tier.amount) : '未填写').join('、') || '—';
    const rechargeTiersSection = isOtherActivity ? '' : `<div class="activity-tier-section activity-tier-section-readonly"><div class="activity-tier-section-head"><div><h3>充值梯度</h3><p>按用户单笔充值金额匹配对应梯度，并发放关联优惠券。</p></div></div><div class="activity-tier-list">${rechargeTierRows}</div></div>`;
    const rechargeAmountPreview = isOtherActivity ? '' : `<div class="preview-row"><span>充值梯度</span><strong>${esc(rechargeTierSummary)}</strong></div>`;
    const readonlyDate = (value, label) => `<input type="date" value="${isLongTerm ? '' : esc(value || '')}" disabled aria-label="${label}">`;
    return `<div class="modal-backdrop modal-centered activity-create-backdrop"><div class="coupon-create-modal activity-create-modal activity-detail-modal" role="dialog" aria-modal="true" aria-labelledby="activity-detail-modal-title"><div class="coupon-create-modal-head"><div><span class="section-kicker">活动中心 / 活动管理中心</span><div class="activity-detail-modal-title"><h2 id="activity-detail-modal-title">活动详情</h2>${statusChip(activity.status)}</div><p>${esc(activity.name)}</p></div><button type="button" class="close-button" data-action="close-modal" aria-label="关闭">×</button></div><div class="activity-create-modal-body"><div class="split-layout activity-form-layout"><div class="card activity-form-card"><div class="card-body">
      <div class="section-block"><h2 class="form-section-title">基本信息</h2><p class="form-section-desc">活动名称和活动说明。</p><div class="form-grid"><div class="field"><label>活动名称</label><input value="${esc(activity.name)}" disabled><span class="field-hint">活动名称仅供当前活动配置使用。</span></div><div class="field"><label>活动类型</label><div class="readonly-field"><span class="source-dot"></span>${esc(activityTypeLabel(activity))}<span class="field-hint">${isOtherActivity ? '常规活动类型来自当前活动配置。' : '储值活动类型由系统默认设置'}</span></div></div><div class="field full"><label>活动说明</label><textarea disabled>${esc(activity.description || '')}</textarea></div></div></div>
      <div class="section-block"><h2 class="form-section-title">规则信息</h2><div class="field"><label>触发方式</label><div class="rule-source-control activity-trigger-options">${triggerButtons}</div><span class="field-hint">${triggerHint}</span></div><div class="activity-time-block"><label class="activity-time-label">活动时间</label><div class="activity-time-grid"><div class="activity-time-field"><div class="activity-time-control"><label class="activity-long-term-switch"><span class="rule-switch"><input type="checkbox"${isLongTerm ? ' checked' : ''} disabled aria-label="活动时间选择长期"><span></span></span><span>长期</span></label><span class="activity-time-divider" aria-hidden="true"></span>${readonlyDate(activity.start, '活动开始日期')}<span class="activity-time-range-separator" aria-hidden="true">至</span>${readonlyDate(activity.end, '活动结束日期')}</div></div></div></div><div class="field"><label>目标资格</label><select disabled><option>${esc(qualification)}</option></select><span class="field-hint">资格判断面向顾客身份。</span></div></div>
      <div class="section-block"><h2 class="form-section-title">发放内容</h2><div class="field activity-coupon-field"><label>${associationLabel}</label>${isCdkTrigger ? '' : '<span class="field-hint activity-coupon-total-hint">数量为 0 时，无限发放。</span>'}<div class="rule-coupon-list">${associationRows}</div></div>${claimLimitField}${rechargeTiersSection}<div class="field rule-limit-field"><label>限制参加</label><div class="rule-switch-line activity-limit-switch"><strong>${limitReceive ? '限制参加次数' : '不限参加次数'}</strong><label class="rule-switch"><input type="checkbox"${limitReceive ? ' checked' : ''} disabled><span></span></label></div></div>${limitReceive ? `<div class="field rule-limit-field activity-limit-count"><label>限制参加次数</label><div class="activity-stepper"><button type="button" class="activity-stepper-button" disabled>−</button><input type="number" value="${limitCount}" disabled><button type="button" class="activity-stepper-button" disabled>＋</button><span>次</span></div></div>` : ''}</div>
      </div></div><aside class="preview-panel"><div class="card preview-card"><div class="preview-label">活动配置预览</div><div class="preview-title">${esc(activity.name || '未命名活动')}</div><div class="preview-divider"></div><div class="preview-row"><span>活动类型</span><strong>${esc(activityTypeLabel(activity))}</strong></div><div class="preview-row"><span>触发方式</span><strong>${esc(activityTriggerLabel(activity))}</strong></div><div class="preview-row"><span>活动时间</span><strong>${esc(isLongTerm ? '长期' : `${time.start} 至 ${time.end}`)}</strong></div>${rechargeAmountPreview}<div class="preview-row"><span>${associationLabel}</span><strong>${associationCount} 个配置</strong></div><div class="preview-row"><span>目标资格</span><strong>${esc(qualification)}</strong></div><div class="preview-row"><span>限制参加</span><strong>${limitReceive ? `每人 ${limitCount} 次` : '不限次数'}</strong></div></div></aside></div></div><div class="activity-detail-modal-foot"><button type="button" class="btn btn-secondary" data-action="close-modal">关闭</button>${canEditActivity(activity) ? `<button type="button" class="btn btn-primary" data-action="activity-edit" data-id="${activity.id}">编辑活动</button>` : ''}</div></div></div>`;
  }
  function renderActivityAssociationCard(activity) {
    const isCdkTrigger = activityTriggerMode(activity) === 'cdk';
    const configs = activityCouponConfigs(activity);
    const batches = (activity.cdkBatchIds || []).map(batchId => state.cdkBatches.find(batch => batch.id === batchId)).filter(Boolean);
    const label = isCdkTrigger ? '关联CDK批次' : (activity.type === 'recharge' ? '关联优惠券与发放总量' : '关联优惠券');
    const items = isCdkTrigger ? batches.map(batch => `<button type="button" class="activity-associated-card" data-action="activity-associated-cdk" data-id="${esc(batch.id)}"><span class="coupon-icon">码</span><span class="activity-associated-main"><strong>${esc(batch.name)}</strong><small>${esc(batch.batchNo)} · ${esc(batch.couponName)}</small></span><span class="activity-associated-arrow">查看详情 →</span></button>`).join('') : configs.map(config => `<button type="button" class="activity-associated-card" data-action="activity-associated-coupon" data-id="${esc(config.id)}"><span class="coupon-icon">券</span><span class="activity-associated-main"><strong>${esc(config.name)}</strong><small>${esc(config.code)} · ${esc(config.description || '优惠券配置')}</small></span><span class="activity-associated-arrow">查看详情 →</span></button>`).join('');
    return `<div class="card activity-detail-association-card"><div class="card-head"><div><h3>${label}</h3><p>当前活动已关联的配置，可进入详情查看</p></div><span class="tag blue">${isCdkTrigger ? batches.length : configs.length} 个</span></div><div class="card-body"><div class="activity-associated-list">${items || `<span class="muted">暂无关联${isCdkTrigger ? 'CDK批次' : '优惠券'}</span>`}</div></div></div>`;
  }
  function renderActivityOverview(activity) {
    const configs = state.couponConfigs.filter(config => (config.activityIds || []).includes(activity.id));
    const bundles = activityBundle(activity);
    const time = activityTimeParts(activity);
    return `<div class="detail-grid"><div class="card"><div class="card-head"><div><h3>活动基本信息</h3><p>活动决定生效时间和业务场景</p></div></div><div class="card-body"><div class="detail-info"><div class="info-item"><span class="label">活动类型</span><strong>${esc(activityTypeLabel(activity))}</strong></div><div class="info-item"><span class="label">使用场景</span><strong>${esc(ACTIVITY_SCENES[activity.sceneCategory])}</strong></div><div class="info-item"><span class="label">开始时间</span><strong>${esc(time.start)}</strong></div><div class="info-item"><span class="label">结束时间</span><strong>${esc(time.end)}</strong></div><div class="info-item"><span class="label">领取/发放限制</span><strong>${esc(activity.limitText)}</strong></div><div class="info-item"><span class="label">触发事件</span><strong>${esc(activity.trigger)}</strong></div><div class="info-item"><span class="label">数据范围</span><strong>${esc(CLUB.name)} · clubId=${esc(CLUB.id)}</strong></div></div><div class="notice" style="margin-top:15px;"><span>i</span><div>${esc(activity.description)}</div></div></div></div><div class="card"><div class="card-head"><div><h3>关联优惠券</h3><p>关联优惠券配置后，发放事件执行时才生成顾客券实例。</p></div><button class="btn btn-secondary btn-small" data-action="associate-coupons-from-activity" data-id="${activity.id}">关联优惠券</button></div><div class="card-body"><div class="bundle-list">${bundles.length ? bundles.map(item => `<div class="bundle-row"><div class="bundle-icon">券</div><div class="bundle-main"><strong>${esc(item.config?.name || item.template?.name || '模板已删除')}</strong><small>${esc(ruleSummary(item.template))} · ${esc(eligibilitySummary(item.template))}</small></div><span class="bundle-qty">配置</span></div>`).join('') : '<span class="muted">暂无关联优惠券配置</span>'}</div>${bundles.length ? `<button class="btn-text" style="margin-top:13px;" data-action="template-from-activity" data-id="${bundles[0].template?.id || ''}">查看关联券模板 →</button>` : ''}</div></div></div>`;
  }
  function renderActivityConfig(activity) {
    const configs = state.couponConfigs.filter(config => (config.activityIds || []).includes(activity.id));
    const configRows = configs.length ? configs.map(config => { const template = couponConfigTemplate(config); return `<div class="association-item"><span class="coupon-icon">券</span><div><strong>${esc(config.name)}</strong><small>${esc(config.code)} · ${esc(ruleSummary(template))}</small></div><button class="btn-text" data-action="coupon-detail" data-id="${config.id}">查看</button></div>`; }).join('') : '<span class="muted">暂无关联优惠券配置</span>';
    return `<div class="card"><div class="card-head"><div><h3>活动触发配置</h3><p>发布后的活动字段作为记录快照保存，关联优惠券单独维护</p></div><span class="tag blue">只读快照</span></div><div class="card-body"><div class="detail-info"><div class="info-item"><span class="label">活动类型</span><strong>${esc(activityTypeLabel(activity))}</strong></div><div class="info-item"><span class="label">触发事件</span><strong>${esc(activity.trigger)}</strong></div><div class="info-item"><span class="label">触发条件</span><strong>${esc(activity.triggerText)}</strong></div><div class="info-item"><span class="label">幂等键示例</span><strong style="font-family:ui-monospace;font-size:11px;">${esc(`${activity.trigger}:userId:activityId`)}</strong></div></div><div class="section-block"><h2 class="form-section-title">关联优惠券配置（${configs.length}）</h2><div class="association-list">${configRows}</div></div></div></div>`;
  }
  function renderActivityData(activity) {
    const redemptionRate = activity.instanceCount ? Math.round((activity.redeemedCount / activity.instanceCount) * 100) : 0;
    return `<div class="stats-grid"><div class="card stat-card"><div class="stat-label"><i></i>发放触发量</div><div class="stat-value"><strong>${int(activity.triggerCount)}</strong><span>次</span></div><div class="stat-foot">事件触发，不等同于到账券实例</div></div><div class="card stat-card teal"><div class="stat-label"><i></i>实际到账券实例</div><div class="stat-value"><strong>${int(activity.instanceCount)}</strong><span>张</span></div><div class="stat-foot">成功生成的 CouponInstance</div></div><div class="card stat-card orange"><div class="stat-label"><i></i>已核销券实例</div><div class="stat-value"><strong>${int(activity.redeemedCount)}</strong><span>张</span></div><div class="stat-foot">含多次使用券的去重实例</div></div><div class="card stat-card purple"><div class="stat-label"><i></i>核销率</div><div class="stat-value"><strong>${redemptionRate}%</strong></div><div class="stat-foot">已核销实例 ÷ 实际到账实例</div></div></div><div class="detail-grid"><div class="card"><div class="card-head"><div><h3>活动转化表现</h3><p>统计以支付成功订单为准</p></div></div><div class="card-body"><div class="metric-inline"><div class="mini-metric"><span>核销次数</span><strong>${int(activity.usageCount)}</strong></div><div class="mini-metric"><span>用券订单成交额</span><strong>${money(activity.gmv)}</strong></div><div class="mini-metric"><span>券均核销次数</span><strong>${activity.redeemedCount ? (activity.usageCount / activity.redeemedCount).toFixed(2) : '0.00'}</strong></div></div><div class="notice" style="margin-top:18px;"><span>i</span><div>一张可重复使用券核销 3 次时：核销券实例数记 1，核销次数记 3，核销率按实例计算。</div></div></div></div><div class="card"><div class="card-head"><div><h3>退款统计</h3><p>当前活动的退款优惠汇总</p></div></div><div class="card-body"><div class="drawer-kv"><div><span>退款冲回优惠</span><strong>${money(activity.redeemedCount * 4.2)}</strong></div></div><button class="btn btn-secondary btn-small" style="margin-top:14px;" data-action="activity-records" data-id="${activity.id}">查看活动记录</button></div></div></div>`;
  }
  function renderActivityRecords(activity) {
    const records = state.records.filter(item => item.activityId === activity.id).slice(0, 8);
    return `<div class="card"><div class="card-head"><div><h3>活动流水</h3><p>发放、领取和核销记录统一关联活动</p></div><button class="btn btn-secondary btn-small" data-action="activity-records" data-id="${activity.id}">进入完整记录</button></div><div class="table-wrap">${records.length ? `<table><thead><tr><th>记录 ID</th><th>类型</th><th>来源</th><th>顾客</th><th>结果</th><th>时间</th><th></th></tr></thead><tbody>${records.map(record => `<tr><td><span class="record-id">${esc(record.id)}</span></td><td>${record.recordType === 'grant' ? '发放' : record.recordType === 'claim' ? '领取' : '核销'}</td><td>${esc(sourceLabel(record.source))}</td><td>${esc(record.customerId)}</td><td>${statusChip(record.status)}</td><td>${esc(record.createdAt)}</td><td><button class="btn-text" data-action="record-detail" data-id="${record.id}">查看</button></td></tr>`).join('')}</tbody></table>` : emptyState('暂无活动记录', '活动触发后，相关流水会在这里出现。')}</div></div>`;
  }

  function renderTemplates() {
    const filter = state.ui.templateFilter;
    const rows = state.templates.filter(item => {
      const q = filter.q.trim().toLowerCase();
      return !q || `${item.name} ${item.code}`.toLowerCase().includes(q);
    });
    const pageSize = state.ui.templatePageSize || 10;
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(Math.max(1, state.ui.templatePage || 1), pageCount);
    state.ui.templatePage = page;
    const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
    const pagination = rows.length ? `<div class="pagination coupon-pagination template-pagination"><div class="pagination-pages"><button class="page-arrow" data-action="template-page-prev" data-page="${page - 1}"${page <= 1 ? ' disabled' : ''} aria-label="上一页">‹</button>${Array.from({ length: pageCount }, (_, index) => index + 1).map(number => `<button class="page-number${number === page ? ' active' : ''}" data-action="template-page-number" data-page="${number}"${number === page ? ' aria-current="page"' : ''}>${number}</button>`).join('')}<button class="page-arrow" data-action="template-page-next" data-page="${page + 1}"${page >= pageCount ? ' disabled' : ''} aria-label="下一页">›</button></div><div class="pagination-summary"><span>共 ${rows.length} 条</span><span>每页显示</span><select data-filter="template-page-size" aria-label="每页显示数量"><option value="10"${pageSize === 10 ? ' selected' : ''}>10</option><option value="20"${pageSize === 20 ? ' selected' : ''}>20</option><option value="50"${pageSize === 50 ? ' selected' : ''}>50</option></select><span>条</span></div></div>` : '';
    return `${couponManagementTabs('templates')}${pageHeading('活动中心 / 优惠券管理中心 / 优惠券管理 / 券模板', '券模板列表', '券模板是可复用的优惠属性框架。默认模板可通过“由模板新增”创建优惠券；自定义模板支持编辑和删除。')}
      <div class="card template-table"><div class="toolbar"><div class="toolbar-left"><button class="btn btn-primary btn-small" data-action="open-template-form">＋ 新建券模板</button><form class="search-form" data-search="templates"><div class="search-box"><span class="search-icon">⌕</span><input name="q" value="${esc(filter.q)}" placeholder="搜索"></div><button type="submit" class="btn btn-secondary btn-small">搜索</button></form></div><div class="toolbar-right"><span class="subtle">共 ${rows.length} 个模板</span></div></div><div class="table-wrap">${rows.length ? `<table><colgroup><col style="width:5%"><col style="width:16%"><col style="width:14%"><col style="width:11%"><col style="width:10%"><col style="width:12%"><col style="width:10%"><col style="width:10%"><col style="width:12%"></colgroup><thead><tr><th>序号</th><th>优惠券名称</th><th>创建/更新时间</th><th>优惠券类型</th><th>优惠金额</th><th>最大折扣金额</th><th>已发放数量</th><th>未核销券数</th><th style="text-align:right;">操作</th></tr></thead><tbody>${pageRows.map((template, index) => renderTemplateRow(template, (page - 1) * pageSize + index + 1)).join('')}</tbody></table>` : emptyState('没有匹配的券模板', '可以输入模板名称或编号进行搜索，或新建一个券模板。')}</div>${pagination}</div>`;
  }

  function renderCoupons() {
    const filter = state.ui.couponFilter;
    const rows = state.couponConfigs.filter(item => {
      const template = couponConfigTemplate(item);
      const q = filter.q.trim().toLowerCase();
      const searchable = `${item.code} ${item.name} ${template?.name || ''}`.toLowerCase();
      return (!q || searchable.includes(q)) && (filter.templateId === 'all' || item.templateId === filter.templateId);
    });
    const pageSize = state.ui.couponPageSize || 10;
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(Math.max(1, state.ui.couponPage || 1), pageCount);
    state.ui.couponPage = page;
    const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
    const pagination = rows.length ? `<div class="pagination coupon-pagination"><div class="pagination-pages"><button class="page-arrow" data-action="coupon-page-prev" data-page="${page - 1}"${page <= 1 ? ' disabled' : ''} aria-label="上一页">‹</button>${Array.from({ length: pageCount }, (_, index) => index + 1).map(number => `<button class="page-number${number === page ? ' active' : ''}" data-action="coupon-page-number" data-page="${number}"${number === page ? ' aria-current="page"' : ''}>${number}</button>`).join('')}<button class="page-arrow" data-action="coupon-page-next" data-page="${page + 1}"${page >= pageCount ? ' disabled' : ''} aria-label="下一页">›</button></div><div class="pagination-summary"><span>共 ${rows.length} 条</span><span>每页显示</span><select data-filter="coupon-page-size" aria-label="每页显示数量"><option value="10"${pageSize === 10 ? ' selected' : ''}>10</option><option value="20"${pageSize === 20 ? ' selected' : ''}>20</option><option value="50"${pageSize === 50 ? ' selected' : ''}>50</option></select><span>条</span></div></div>` : '';
    const assocBanner = state.ui.associationContext?.target === 'activity-coupon' ? '<div class="info-banner association-banner"><span>↗</span><div>正在为活动选择优惠券配置，请点击“选择”完成关联。</div></div>' : '';
    return `${couponManagementTabs('coupon-form')}${pageHeading('活动中心 / 优惠券管理中心', '优惠券列表', '优惠券配置可关联多个活动；顾客券实例会在发放后生成。')}${assocBanner}
      <div class="card coupon-table"><div class="toolbar"><div class="toolbar-left"><button class="btn btn-primary" data-action="open-coupon-create">＋ 新增优惠券</button><form class="search-form" data-search="coupons"><div class="search-box"><span class="search-icon">⌕</span><input name="q" value="${esc(filter.q)}" placeholder="搜索配置名称"></div><button type="submit" class="btn btn-secondary btn-small">搜索</button></form></div><div class="toolbar-right"><span class="subtle">共 ${rows.length} 个优惠券配置</span></div></div><div class="table-wrap">${rows.length ? `<table><colgroup><col style="width:5%"><col style="width:18%"><col style="width:14%"><col style="width:11%"><col style="width:10%"><col style="width:12%"><col style="width:10%"><col style="width:10%"><col style="width:10%"></colgroup><thead><tr><th>序号</th><th>优惠券名称</th><th>创建/更新时间</th><th>优惠券类型</th><th>优惠金额</th><th>最大折扣金额</th><th>已发放数量</th><th>未核销券数</th><th style="text-align:right;">操作</th></tr></thead><tbody>${pageRows.map((config, index) => renderCouponConfigRow(config, (page - 1) * pageSize + index + 1)).join('')}</tbody></table>` : emptyState('没有匹配的优惠券配置', '可以调整搜索条件，或点击“新增优惠券”建立一个配置批次。')}</div>${pagination}</div>`;
  }

  function renderCouponConfigRow(config, serialNumber) {
    const template = couponConfigTemplate(config);
    const actions = state.ui.associationContext ? `<button class="btn-text" data-action="select-associated-coupon" data-id="${config.id}">选择</button>` : `<button class="btn-text" data-action="coupon-detail" data-id="${config.id}">详情</button><button class="btn-text danger" data-action="coupon-config-delete" data-id="${config.id}">删除</button>`;
    return `<tr><td class="coupon-list-index">${serialNumber}</td><td><div class="template-name coupon-list-name"><div><strong>${esc(config.name)}</strong></div></div></td><td>${esc(formatDate(config.createdAt))}</td><td>${tag(couponTypeLabel(config, template), template?.calcMethod === 'discount' ? 'teal' : 'blue')}</td><td class="coupon-list-value">${esc(couponAmountLabel(template))}</td><td>${esc(couponMaxDiscountLabel(template))}</td><td class="coupon-list-number">${int(config.issuedCount)}</td><td class="coupon-list-number">${int(config.availableCount)}</td><td><div class="action-group">${actions}</div></td></tr>`;
  }

  function blankCouponDraft() {
    return { id: '', name: '', description: '', preset: '', templateId: '', ruleId: '', activityIds: ['act-new'], calcMethod: 'fixed', amount: 20, threshold: 100, discountRate: 0, maxDiscount: 0, eligibility: 'first_order', sceneTags: ['拉新'], scopeGames: [], scopeServices: [], scopeSelections: [{ game: '', category: '', product: '' }], orderMin: '', orderMax: '', validityMode: 'relative', validDays: 7, fixedStart: '', fixedEnd: '', usageMode: 'single', totalAmount: 20, maxUses: 1, stackable: false };
  }
  function couponDraftFor(id = '') {
    if (state.ui.couponDraft && String(state.ui.couponDraft.id || '') === String(id || '')) return clone(state.ui.couponDraft);
    if (id) {
      const config = getCouponConfig(id);
      if (config) return clone({ ...(config.ruleSnapshot || getTemplate(config.templateId) || {}), ...config });
    }
    return clone(state.ui.couponDraft || blankCouponDraft());
  }
  function openCouponModal(id, readonly = false) {
    const config = getCouponConfig(id);
    if (!config) return;
    state.ui.couponDraft = null;
    const draft = couponDraftFor(id);
    state.ui.couponDraft = draft;
    state.ui.couponReadonly = Boolean(readonly);
    state.ui.couponReturnToDetail = false;
    state.ui.couponAdvancedExpanded = readonly ? true : (couponTypePresetKey(draft) === 'custom' ? true : null);
    state.ui.modal = { type: 'coupon-form', id, readonly: Boolean(readonly) };
    if (window.location.hash !== '#coupon-form') window.location.hash = '#coupon-form'; else render();
  }
  function couponConfigTemplate(config) { return config?.ruleSnapshot || getTemplate(config?.templateId); }
  function renderCouponRuleEditor(draft) {
    const isDiscount = draft.calcMethod === 'discount';
    const isMulti = draft.usageMode === 'multi';
    const isRelative = draft.validityMode === 'relative';
    const scenes = ['节日', '拉新', '充值', '回流', '日常'];
    const games = ['王者荣耀', '和平精英', '英雄联盟手游'];
    const services = ['陪玩', '陪练', '代练'];
    return `<div class="section-block"><h2 class="form-section-title">临时调整优惠规则</h2><p class="form-section-desc">以下字段初始来自券模板，修改只作用于当前优惠券配置，不回写模板；已生成顾客券仍保留发放时快照。</p><input type="hidden" name="calcMethod" value="${esc(draft.calcMethod)}"><div class="seg-control"><button type="button" class="${!isDiscount ? 'active' : ''}" data-action="coupon-calc" data-value="fixed">固定减免</button><button type="button" class="${isDiscount ? 'active' : ''}" data-action="coupon-calc" data-value="discount">折扣</button></div><div class="form-grid" style="margin-top:14px;">${!isDiscount ? `<div class="field"><label>减免金额<em>*</em></label><div class="input-prefix"><span>¥</span><input type="number" min="0.01" step="0.01" name="amount" value="${esc(draft.amount)}"></div></div><div class="field"><label>使用门槛</label><div class="input-suffix"><input type="number" min="0" step="0.01" name="threshold" value="${esc(draft.threshold)}"><span>元，0 表示无门槛</span></div></div>` : `<div class="field"><label>折扣比例<em>*</em></label><div class="input-suffix"><input type="number" min="1" max="99" name="discountRate" value="${esc(draft.discountRate)}"><span>如 80 = 8 折</span></div></div><div class="field"><label>最高优惠金额<em>*</em></label><div class="input-prefix"><span>¥</span><input type="number" min="0.01" step="0.01" name="maxDiscount" value="${esc(draft.maxDiscount)}"></div></div>`}</div></div>
      <div class="section-block"><h2 class="form-section-title">顾客资格与场景标签</h2><p class="form-section-desc">首单资格只在结算 evaluate 时判断；新客活动的发放触发与首单核销资格互不绑定。</p><input type="hidden" name="eligibility" value="${esc(draft.eligibility)}"><div class="seg-control"><button type="button" class="${draft.eligibility === 'first_order' ? 'active' : ''}" data-action="coupon-eligibility" data-value="first_order">仅俱乐部首单</button><button type="button" class="${draft.eligibility === 'unlimited' ? 'active' : ''}" data-action="coupon-eligibility" data-value="unlimited">不限首单</button></div><div class="field" style="margin-top:14px;"><label>场景标签（可多选）</label><div class="choice-list">${scenes.map((item, index) => `<div class="choice-chip"><input id="coupon-scene-${index}" type="checkbox" name="sceneTags" value="${item}"${checked((draft.sceneTags || []).includes(item))}><label for="coupon-scene-${index}">${item}</label></div>`).join('')}</div></div></div>
      <div class="section-block"><div class="advanced-box"><div class="advanced-head"><div><strong>高级设置</strong><span>　适用范围、有效期、使用方式</span></div><span>已展开</span></div><div class="advanced-body"><div class="form-grid"><div class="field"><label>适用游戏</label><div class="choice-list">${games.map((item, index) => `<div class="choice-chip"><input id="coupon-game-${index}" type="checkbox" name="scopeGames" value="${item}"${checked((draft.scopeGames || []).includes(item))}><label for="coupon-game-${index}">${item}</label></div>`).join('')}</div><span class="field-hint">同一维度任一满足；未选择表示不限。</span></div><div class="field"><label>适用服务类型</label><div class="choice-list">${services.map((item, index) => `<div class="choice-chip"><input id="coupon-service-${index}" type="checkbox" name="scopeServices" value="${item}"${checked((draft.scopeServices || []).includes(item))}><label for="coupon-service-${index}">${item}</label></div>`).join('')}</div><span class="field-hint">与游戏维度同时配置时，两个维度需同时满足。</span></div><div class="field"><label>有效期方式<em>*</em></label><input type="hidden" name="validityMode" value="${esc(draft.validityMode)}"><div class="seg-control"><button type="button" class="${isRelative ? 'active' : ''}" data-action="coupon-validity" data-value="relative">领取后 N 个自然日</button><button type="button" class="${!isRelative ? 'active' : ''}" data-action="coupon-validity" data-value="fixed">固定日期</button></div></div>${isRelative ? `<div class="field"><label>有效天数<em>*</em></label><div class="input-suffix"><input type="number" min="1" name="validDays" value="${esc(draft.validDays)}"><span>天</span></div></div>` : `<div class="field"><label>固定日期<em>*</em></label><div class="input-suffix"><input type="date" name="fixedStart" value="${esc(draft.fixedStart || '')}"><span>至</span><input type="date" name="fixedEnd" value="${esc(draft.fixedEnd || '')}"></div></div>`}<div class="field"><label>使用方式<em>*</em></label><input type="hidden" name="usageMode" value="${esc(draft.usageMode)}"><div class="seg-control"><button type="button" class="${!isMulti ? 'active' : ''}" data-action="coupon-usage" data-value="single">单次使用</button><button type="button" class="${isMulti ? 'active' : ''}" data-action="coupon-usage" data-value="multi">可多次使用</button></div></div>${isMulti ? (isDiscount ? `<div class="field"><label>最大使用次数<em>*</em></label><div class="input-suffix"><input type="number" min="1" name="maxUses" value="${esc(draft.maxUses)}"><span>次</span></div></div>` : `<div class="field"><label>总可用面额<em>*</em></label><div class="input-prefix"><span>¥</span><input type="number" min="0.01" step="0.01" name="totalAmount" value="${esc(draft.totalAmount || draft.amount)}"></div></div>`) : '<div class="field"><label>使用说明</label><div class="field-hint" style="padding-top:10px;">每单最多一张，不支持多券叠加。</div></div>'}</div></div></div></div>`;
  }
  const COUPON_TYPE_PRESETS = [
    { key: 'new', icon: '🎁', title: '新客券', description: '仅首单可用 · 领取后 7 天', templateId: 'tpl-new' },
    { key: 'threshold', icon: '💰', title: '满减券', description: '满 X 减 Y · 领取后 7 天', templateId: 'tpl-threshold' },
    { key: 'discount', icon: '🏷️', title: '折扣券', description: '打折并封顶 · 领取后 15 天', templateId: 'tpl-discount' },
    { key: 'festival', icon: '🎉', title: '节日券', description: '指定日期使用 · 节日场景', templateId: 'tpl-festival' },
    { key: 'custom', icon: '🧩', title: '自定义类型', description: '选择已保存的自定义券模板', templateId: '' }
  ];
  COUPON_TYPE_PRESETS.find(item => item.key === 'custom').title = '自定义模板';
  function couponTypePresetKey(draft) {
    return draft.preset || getTemplate(draft.templateId)?.preset || '';
  }
  function couponTypePresetLabel(draft) {
    return COUPON_TYPE_PRESETS.find(item => item.key === couponTypePresetKey(draft))?.title || '未选择模板';
  }
  function renderCouponTypeChooserLegacy(draft, availableTemplates = []) {
    const active = couponTypePresetKey(draft);
    const isCustom = active === 'custom';
    const customTemplates = availableTemplates.filter(item => item.source === 'custom');
    const templateField = isCustom
      ? `<div class="coupon-custom-template-field"><label>选择自定义券模板<em>*</em></label><select name="templateId">${customTemplates.length ? customTemplates.map(item => `<option value="${item.id}"${selected(draft.templateId, item.id)}>${esc(item.name)} · ${esc(ruleSummary(item))}</option>`).join('') : '<option value="">暂无可用的自定义券模板</option>'}</select><span class="field-hint">自定义类型基于可复用模板生成；选择后仍可在高级设置中临时调整。</span></div>`
      : `<input type="hidden" name="templateId" value="${esc(draft.templateId)}">`;
    return `<section class="card coupon-step-card coupon-type-section"><div class="coupon-step-title"><div><h2>① 选择券类型</h2><span>选择一个类型，自动带入下方高级设置</span></div><span class="step-state">${active ? '已选择' : '待选择'}</span></div><p class="form-section-desc">类型只是快捷配置入口，保存后的真实规则仍以优惠计算方式、顾客资格和适用范围为准。</p><input type="hidden" name="preset" value="${esc(active)}"><div class="coupon-type-grid">${COUPON_TYPE_PRESETS.map(item => `<button type="button" class="coupon-type-card${active === item.key ? ' active' : ''}" data-action="coupon-preset" data-preset="${item.key}"><span class="coupon-type-icon">${item.icon}</span><strong>${item.title}</strong><small>${item.description}</small>${active === item.key ? '<span class="preset-badge">✓ 已选择</span>' : ''}</button>`).join('')}</div>${templateField}</section>`;
  }
  function renderCouponTypeChooser(draft, availableTemplates = [], mode = 'coupon') {
    if (mode === 'coupon' && state.ui.couponReadonly && state.ui.modal?.type === 'coupon-form') return '';
    const rendered = renderCouponTypeChooserLegacy(draft, availableTemplates)
      .replace('① 选择券类型', '① 选择券模板')
      .replace('选择一个类型，自动带入下方高级设置', '选择一个模板，自动带入下方高级设置')
      .replace('类型只是快捷配置入口', '模板只是快捷配置入口')
      .replaceAll('自定义类型', '自定义模板');
    return mode === 'template'
      ? rendered.replace(/<div class="coupon-custom-template-field">[\s\S]*?<\/div><\/section>/, `<input type="hidden" name="templateId" value=""><\/section>`)
      : rendered;
  }
  function renderCouponBasicInfo(draft) {
    const isDiscount = draft.calcMethod === 'discount';
    return `<section class="card coupon-step-card">
      <div class="coupon-step-title"><div><h2>② 填写基本信息</h2><span>优惠券展示给运营和顾客的基础内容</span></div></div>
      <div class="form-grid coupon-basic-grid">
        <div class="field full"><label>优惠券名称<em>*</em></label><input name="name" value="${esc(draft.name)}" placeholder="例如：新客专享券" maxlength="30"></div>
        <div class="field"><label>${isDiscount ? '折扣比例' : '优惠面额'}<em>*</em></label>${isDiscount ? `<div class="input-suffix"><input type="number" min="1" max="99" name="discountRate" value="${esc(draft.discountRate)}" placeholder="如 80"><span>折扣百分比，80 = 8 折</span></div>` : `<div class="input-prefix"><span>¥</span><input type="number" min="0.01" step="0.01" name="amount" value="${esc(draft.amount)}" placeholder="如 20"></div>`}</div>
        ${isDiscount ? `<div class="field"><label>最高优惠金额<em>*</em></label><div class="input-prefix"><span>¥</span><input type="number" min="0.01" step="0.01" name="maxDiscount" value="${esc(draft.maxDiscount)}" placeholder="如 50"></div></div><div class="field"><label>使用门槛<em>*</em></label><div class="input-suffix"><input type="number" min="0.01" step="0.01" name="threshold" value="${esc(draft.threshold)}" placeholder="如 100"><span>元起用</span></div></div>` : `<div class="field"><label>使用门槛</label><div class="input-suffix"><input type="number" min="0" step="0.01" name="threshold" value="${esc(draft.threshold)}" placeholder="0"><span>元，0 表示无门槛</span></div></div>`}
        <div class="field full"><label>优惠券描述</label><input name="description" value="${esc(draft.description)}" placeholder=""></div>
      </div>
    </section>`;
  }
  function renderCouponAdvancedSettingsLegacy(draft) {
    const isDiscount = draft.calcMethod === 'discount';
    const isMulti = draft.usageMode === 'multi';
    const isRelative = draft.validityMode === 'relative';
    const games = ['王者荣耀', '和平精英', '英雄联盟手游'];
    const services = ['陪玩', '陪练', '代练'];
    const scenes = ['节日', '拉新', '充值', '回流', '日常'];
    return `<section class="card coupon-step-card coupon-advanced-section"><div class="coupon-step-title"><div><h2>③ 高级设置</h2><span>选择券类型后自动配置，可继续调整</span></div><span class="tag purple">${esc(couponTypePresetLabel(draft))}</span></div><div class="advanced-box coupon-advanced-box"><div class="advanced-head"><div><strong>优惠规则</strong><span>　范围、有效期、首单限制和使用方式</span></div><span class="step-state">动态配置</span></div><div class="advanced-body"><div class="form-grid"><div class="field full"><label>优惠计算方式</label><input type="hidden" name="calcMethod" value="${esc(draft.calcMethod)}"><div class="seg-control"><button type="button" class="${!isDiscount ? 'active' : ''}" data-action="coupon-calc" data-value="fixed">固定减免</button><button type="button" class="${isDiscount ? 'active' : ''}" data-action="coupon-calc" data-value="discount">折扣</button></div><span class="field-hint">“满减”是固定减免 + 使用门槛的快捷展示。</span></div><div class="field"><label>有效期方式<em>*</em></label><input type="hidden" name="validityMode" value="${esc(draft.validityMode)}"><div class="seg-control"><button type="button" class="${isRelative ? 'active' : ''}" data-action="coupon-validity" data-value="relative">领取后 N 个自然日</button><button type="button" class="${!isRelative ? 'active' : ''}" data-action="coupon-validity" data-value="fixed">固定日期</button></div></div>${isRelative ? `<div class="field"><label>有效天数<em>*</em></label><div class="input-suffix"><input type="number" min="1" name="validDays" value="${esc(draft.validDays)}"><span>天，首日计入</span></div></div>` : `<div class="field"><label>固定日期<em>*</em></label><div class="input-suffix"><input type="date" name="fixedStart" value="${esc(draft.fixedStart || '')}"><span>至</span><input type="date" name="fixedEnd" value="${esc(draft.fixedEnd || '')}"></div></div>`}<div class="field"><label>使用方式<em>*</em></label><input type="hidden" name="usageMode" value="${esc(draft.usageMode)}"><div class="seg-control"><button type="button" class="${!isMulti ? 'active' : ''}" data-action="coupon-usage" data-value="single">单次使用</button><button type="button" class="${isMulti ? 'active' : ''}" data-action="coupon-usage" data-value="multi">可多次使用</button></div></div>${isMulti ? (isDiscount ? `<div class="field"><label>最大使用次数<em>*</em></label><div class="input-suffix"><input type="number" min="1" name="maxUses" value="${esc(draft.maxUses)}"><span>次</span></div></div>` : `<div class="field"><label>总可用面额<em>*</em></label><div class="input-prefix"><span>¥</span><input type="number" min="0.01" step="0.01" name="totalAmount" value="${esc(draft.totalAmount || draft.amount)}"></div></div>`) : ''}<div class="field"><label>适用游戏</label><div class="choice-list">${games.map((item, index) => `<div class="choice-chip"><input id="coupon-advanced-game-${index}" type="checkbox" name="scopeGames" value="${item}"${checked((draft.scopeGames || []).includes(item))}><label for="coupon-advanced-game-${index}">${item}</label></div>`).join('')}</div><span class="field-hint">同一维度任一满足；未选择表示不限。</span></div><div class="field"><label>适用服务类型</label><div class="choice-list">${services.map((item, index) => `<div class="choice-chip"><input id="coupon-advanced-service-${index}" type="checkbox" name="scopeServices" value="${item}"${checked((draft.scopeServices || []).includes(item))}><label for="coupon-advanced-service-${index}">${item}</label></div>`).join('')}</div><span class="field-hint">与游戏维度同时配置时，两个维度需同时满足。</span></div><div class="field"><label>顾客资格<em>*</em></label><input type="hidden" name="eligibility" value="${esc(draft.eligibility)}"><div class="seg-control"><button type="button" class="${draft.eligibility === 'first_order' ? 'active' : ''}" data-action="coupon-eligibility" data-value="first_order">仅俱乐部首单</button><button type="button" class="${draft.eligibility === 'unlimited' ? 'active' : ''}" data-action="coupon-eligibility" data-value="unlimited">不限首单</button></div><span class="field-hint">只在结算 evaluate 时判断，不影响新客发放事件。</span></div><div class="field"><label>场景标签（可多选）</label><div class="choice-list">${scenes.map((item, index) => `<div class="choice-chip"><input id="coupon-advanced-scene-${index}" type="checkbox" name="sceneTags" value="${item}"${checked((draft.sceneTags || []).includes(item))}><label for="coupon-advanced-scene-${index}">${item}</label></div>`).join('')}</div></div></div></div></div></section>`;
  }
  function renderCouponAdvancedSettings(draft, mode = 'coupon') {
    const isDiscount = draft.calcMethod === 'discount';
    const effectiveUsageMode = isDiscount ? 'single' : draft.usageMode;
    const isMulti = effectiveUsageMode === 'multi';
    const isRelative = draft.validityMode === 'relative';
    const games = ['王者荣耀', '无畏契约', '和平精英'];
    const services = [['陪玩', '技术陪玩'], ['陪练', '娱乐陪玩'], ['代练', '代练']];
    const eligibilityField = renderCouponUserQualification(draft);
    const stackable = Boolean(draft.stackable);
    const stackableField = `<div class="coupon-setting-row"><label>可叠加</label><div class="coupon-setting-control"><input type="hidden" name="stackable" value="${stackable}"><button type="button" class="toggle-switch${stackable ? ' active' : ''}" data-action="coupon-stackable" data-value="${!stackable}" aria-pressed="${stackable}"><span></span></button><span class="field-hint">${stackable ? '当前已开启，可与其他优惠券叠加使用。' : '当前未开启，不可与其他优惠券叠加使用。'}</span></div></div>`;
    const scopeBuilder = `${stackableField}${renderCouponScopeBuilder(draft)}`;
    const expandedState = mode === 'template' ? state.ui.templateAdvancedExpanded : state.ui.couponAdvancedExpanded;
    const advancedExpanded = expandedState === null ? couponTypePresetKey(draft) === 'custom' : expandedState;
    const maxUses = Math.max(1, Math.floor(num(draft.maxUses, 1)));
    const canSplitAmount = amountCanSplitEvenly(draft.amount, maxUses);
    const perUseAmountLabel = canSplitAmount ? `每次优惠 ${money(amountPerUse(draft.amount, maxUses))}` : '无法平均分配，请调整金额或次数';
    const usageField = `<div class="coupon-setting-row"><label>可多次使用</label><div class="coupon-setting-control${isDiscount ? ' is-disabled' : ''}"><input type="hidden" name="usageMode" value="${esc(effectiveUsageMode)}"><button type="button" class="toggle-switch${isMulti ? ' active' : ''}${isDiscount ? ' disabled' : ''}" data-action="coupon-usage" data-value="${isMulti ? 'single' : 'multi'}" aria-pressed="${isMulti}"${isDiscount ? ' disabled' : ''}><span></span></button><span class="field-hint">${isDiscount ? '折扣券仅支持单次使用。' : `定额券支持多次使用${isMulti ? '，当前已开启。' : '；当前未开启。'}`}</span>${isMulti && !isDiscount ? `<div class="coupon-multi-amount"><label>最大使用次数</label><div class="input-suffix"><input type="number" min="2" step="1" name="maxUses" value="${esc(maxUses)}"><span>次</span></div><span class="field-hint${canSplitAmount ? '' : ' field-error'}" data-per-use-amount="true">${perUseAmountLabel}</span></div>` : ''}</div></div>`;
    return `<section class="card coupon-step-card coupon-advanced-section"><div class="coupon-step-title"><div><h2>③ 高级设置</h2><span>适用范围 · 有效期 · 首单限制——不改也能用</span></div><span class="tag purple">${esc(couponTypePresetLabel(draft))}</span></div><div class="advanced-box coupon-advanced-box${advancedExpanded ? ' expanded' : ' collapsed'}"><div class="advanced-head advanced-toggle" data-action="coupon-advanced-toggle" role="button" tabindex="0" aria-expanded="${advancedExpanded}"><div><strong>高级设置</strong><span>　适用范围、有效期、首单限制和使用方式</span></div><span class="step-state">${advancedExpanded ? '收起' : '展开'}</span></div><div class="advanced-body coupon-settings-body"><div class="coupon-setting-grid"><div class="coupon-setting-row"><label>券类型</label><div class="coupon-setting-control"><input type="hidden" name="calcMethod" value="${esc(draft.calcMethod)}"><div class="seg-control"><button type="button" class="${!isDiscount ? 'active' : ''}" data-action="coupon-calc" data-value="fixed">定额券</button><button type="button" class="${isDiscount ? 'active' : ''}" data-action="coupon-calc" data-value="discount">折扣券</button></div><span class="field-hint">选择券类型后已自动确定，一般无需修改。</span></div></div><div class="coupon-setting-row"><label>有效期</label><div class="coupon-setting-control"><input type="hidden" name="validityMode" value="${esc(draft.validityMode)}"><div class="seg-control"><button type="button" class="${isRelative ? 'active' : ''}" data-action="coupon-validity" data-value="relative">领取后 N 天</button><button type="button" class="${!isRelative ? 'active' : ''}" data-action="coupon-validity" data-value="fixed">固定日期</button></div>${isRelative ? `<div class="input-suffix coupon-inline-input"><span>领取后</span><input type="number" min="1" name="validDays" value="${esc(draft.validDays)}"><span>天内有效</span></div>` : `<div class="input-suffix coupon-inline-input"><input type="date" name="fixedStart" value="${esc(draft.fixedStart || '')}"><span>至</span><input type="date" name="fixedEnd" value="${esc(draft.fixedEnd || '')}"></div>`}<span class="field-hint">日常券用“领取后 N 天”；指定节日再选择“固定日期”。</span></div></div>${usageField}${scopeBuilder}${eligibilityField}</div></div></div></section>`;
  }

  function renderCouponCreateForm(id = '') {
    const draft = couponDraftFor(id);
    state.ui.couponDraft = draft;
    const availableTemplates = state.templates.filter(item => item.status !== 'offline');
    const previewValue = draft.calcMethod === 'discount' ? `${num(draft.discountRate) / 10} 折` : `¥${num(draft.amount)}`;
    const previewType = draft.calcMethod === 'discount' ? '折扣券' : '定额券';
    const previewThreshold = draft.calcMethod === 'fixed' && num(draft.threshold) > 0 ? `满${num(draft.threshold)}元可用` : '无门槛';
     return `${pageHeading('活动中心 / 优惠券管理中心 / 优惠券列表', id ? '编辑优惠券配置' : '新增优惠券', '优惠券配置按券类型和优惠规则完成。', '<button class="btn btn-secondary" data-route="coupon-form">返回优惠券列表</button>')}<div class="split-layout coupon-create-layout"><div class="coupon-create-main"><form data-form="coupon-config" data-id="${esc(id)}">${renderCouponTypeChooser(draft, availableTemplates)}${renderCouponBasicInfo(draft)}${renderCouponAdvancedSettings(draft)}<div class="card coupon-step-card"><div class="form-actions"><button type="button" class="btn btn-secondary" data-route="coupon-form">取消</button><button type="button" class="btn btn-primary" data-action="save-coupon" data-mode="publish">${id ? '保存并生效' : '发布优惠券'}</button></div></div></form></div><aside class="preview-panel"><div class="card preview-card coupon-preview-card"><div class="preview-label">优惠券配置预览</div><div class="preview-value${draft.calcMethod === 'discount' ? ' discount' : ''}">${esc(previewValue)}<small>${draft.calcMethod === 'discount' ? `最高优惠 ${num(draft.maxDiscount)} 元` : '固定减免'}</small></div><div class="preview-title">${esc(draft.name || '未命名优惠券')}</div><div class="preview-divider"></div><div class="preview-row"><span>优惠券类型</span><strong>${esc(previewType)}</strong></div><div class="preview-row"><span>优惠券描述</span><strong>${esc(draft.description || '—')}</strong></div><div class="preview-row"><span>使用门槛</span><strong>${esc(previewThreshold)}</strong></div><div class="preview-row"><span>用户资格</span><strong>${esc(eligibilitySummary(draft))}</strong></div><div class="preview-row"><span>适用范围</span><strong>${esc(scopeSummary(draft))}</strong></div><div class="preview-row"><span>有效期</span><strong>${esc(validitySummary(draft))}</strong></div><div class="preview-row"><span>可多次使用</span><strong>${draft.calcMethod !== 'discount' && draft.usageMode === 'multi' ? '是' : '否'}</strong></div><div class="preview-row"><span>可叠加</span><strong>${draft.stackable ? '是' : '否'}</strong></div><div class="preview-foot">优惠券生效后仍可调整配置，但只影响后续发放；已到账顾客券保留发放时快照。</div></div></aside></div>`;
  }

  function renderCouponAssociatedActivities(id) {
    const config = getCouponConfig(id);
    const activities = (config?.activityIds || []).map(getActivity).filter(activitySupported);
    const content = activities.length
      ? activities.map(activity => `<button type="button" class="coupon-associated-activity" data-action="activity-detail" data-id="${esc(activity.id)}"><strong>${esc(activity.name)}</strong><span>${esc(activityTypeLabel(activity))} · ${esc(formatDate(activity.start))}—${esc(formatDate(activity.end) || '长期有效')}</span><b>查看详情 →</b></button>`).join('')
      : '<span class="muted">暂无关联活动</span>';
    return `<div class="card coupon-associated-activities-card"><div class="card-head"><div><h3>关联活动</h3><p>当前优惠券配置已关联的活动</p></div></div><div class="card-body coupon-associated-activities-list">${content}</div></div>`;
  }

  function renderCouponAssociatedCdkBatches(id) {
    const batches = state.cdkBatches.filter(batch => (batch.couponIds || []).includes(id));
    if (!batches.length) return '';
    const content = batches.map(batch => `<button type="button" class="coupon-associated-cdk" data-action="cdk-detail" data-id="${esc(batch.id)}"><span><strong>${esc(batch.name)}</strong><small>${esc(batch.batchNo)} · ${esc(batch.activityName)}</small></span><b>查看详情 →</b></button>`).join('');
    return `<div class="card coupon-associated-cdk-card"><div class="card-head"><div><h3>关联CDK批次</h3><p>当前优惠券配置已关联的CDK批次</p></div><span class="tag blue">${batches.length} 个</span></div><div class="card-body coupon-associated-cdk-list">${content}</div></div>`;
  }

  function renderCouponRecordsAction(id) {
    return `<div class="card coupon-detail-records-card"><button type="button" class="btn btn-secondary coupon-detail-records-button" data-action="coupon-records" data-tab="grant" data-id="${esc(id)}">查看发放与核销记录</button></div>`;
  }

  function renderCouponCreateModal(id = '') {
    const readonly = Boolean(state.ui.couponReadonly && id);
    const fullPage = renderCouponCreateForm(id);
    const bodyStart = fullPage.indexOf('<div class="split-layout coupon-create-layout">');
    let body = bodyStart >= 0 ? fullPage.slice(bodyStart) : fullPage;
    body = body.replaceAll('① 选择券类型', '选择券类型').replaceAll('① 选择券模板', '选择券模板').replaceAll('② 填写基本信息', '填写基本信息').replaceAll('③ 高级设置', '高级设置');
    body = body.replaceAll('<div class="preview-foot">优惠券生效后仍可调整配置，但只影响后续发放；已到账顾客券保留发放时快照。</div>', '');
    if (readonly) {
      body = body.replace('<form data-form="coupon-config" data-id="', '<form data-form="coupon-config" data-readonly="true" data-id="');
      body = body.replaceAll('② 填写基本信息', '填写基本信息').replaceAll('③ 高级设置', '高级设置');
      const asideEnd = body.lastIndexOf('</aside></div>');
      if (asideEnd >= 0) body = `${body.slice(0, asideEnd)}${renderCouponAssociatedActivities(id)}${renderCouponAssociatedCdkBatches(id)}${renderCouponRecordsAction(id)}${body.slice(asideEnd)}`;
    }
    const title = readonly ? '优惠券详情' : (id ? '编辑优惠券配置' : '新增优惠券');
    return `<div class="modal-backdrop modal-centered coupon-create-backdrop"><div class="coupon-create-modal${readonly ? ' coupon-readonly-modal' : ''}" role="dialog" aria-modal="true" aria-labelledby="coupon-create-modal-title"><div class="coupon-create-modal-head"><div><span class="section-kicker">活动中心 / 优惠券管理中心 / 优惠券列表</span><h2 id="coupon-create-modal-title">${title}</h2><p>按券类型和活动完成优惠券配置。</p></div><button type="button" class="close-button" data-action="close-modal" aria-label="关闭">×</button></div><div class="coupon-create-modal-body">${body}</div></div></div>`;
  }


  function renderTemplateRow(template, serialNumber) {
    const editButton = template.source !== 'default' && template.status !== 'offline' ? `<button class="btn-text" data-action="template-edit" data-id="${template.id}">编辑</button>` : '';
    const deleteButton = template.source !== 'default' ? `<button class="btn-text danger" data-action="template-delete" data-id="${template.id}">删除</button>` : '';
    const unredeemedCount = Math.max(0, int(template.issued) - int(template.redeemed));
    return `<tr><td class="template-list-index">${serialNumber}</td><td><div class="template-name"><div><strong>${esc(template.name)}${template.locked ? '<span class="locked-mark">⌑</span>' : ''}</strong></div></div></td><td>${esc(formatDate(template.createdAt))}</td><td>${tag(template.calcMethod === 'discount' ? '折扣券' : '定额券', template.calcMethod === 'discount' ? 'teal' : 'blue')}</td><td class="template-list-value">${esc(couponAmountLabel(template))}</td><td>${esc(couponMaxDiscountLabel(template))}</td><td class="coupon-list-number">${int(template.issued)}</td><td class="coupon-list-number">${unredeemedCount}</td><td><div class="action-group">${editButton}<button class="btn-text" data-action="template-create-coupon" data-id="${template.id}">由模板新增</button>${deleteButton}</div></td></tr>`;
  }

  function blankTemplateDraft() {
    return { id: '', name: '', description: '', preset: '', templateId: '', calcMethod: 'fixed', amount: 20, threshold: 0, discountRate: 80, maxDiscount: 0, eligibility: 'unlimited', sceneTags: [], scopeGames: [], scopeServices: [], scopeSelections: [{ game: '', category: '', product: '' }], validityMode: 'relative', validDays: 7, fixedStart: '', fixedEnd: '', usageMode: 'single', totalAmount: 20, maxUses: 1, stackable: false };
  }
  function templateDraftFor(id) {
    if (state.ui.templateDraft && String(state.ui.templateDraft.id || '') === String(id || '')) return clone(state.ui.templateDraft);
    if (id) {
      const template = getTemplate(id);
      if (template) return clone(template);
    }
    return clone(state.ui.templateDraft && !state.ui.templateDraft.id ? state.ui.templateDraft : blankTemplateDraft());
 }
 function templatePresetConfig(preset) {
    const presets = {
      new: { name: '新客首单减20', description: '首次成为本俱乐部新客时到账，仅首单可用。', calcMethod: 'fixed', amount: 20, threshold: 100, discountRate: 0, maxDiscount: 0, eligibility: 'first_order', sceneTags: ['拉新'], validityMode: 'relative', validDays: 7, fixedStart: '', fixedEnd: '', usageMode: 'single', totalAmount: 20, maxUses: 1 },
      threshold: { name: '满500减100', description: '订单服务金额满 500 元可使用。', calcMethod: 'fixed', amount: 100, threshold: 500, discountRate: 0, maxDiscount: 0, eligibility: 'unlimited', sceneTags: ['日常'], validityMode: 'relative', validDays: 7, fixedStart: '', fixedEnd: '', usageMode: 'single', totalAmount: 100, maxUses: 1 },
      discount: { name: '全场8折券', description: '订单服务金额 8 折，单次最多优惠 50 元。', calcMethod: 'discount', amount: 0, threshold: 0, discountRate: 80, maxDiscount: 50, eligibility: 'unlimited', sceneTags: ['日常'], validityMode: 'relative', validDays: 15, fixedStart: '', fixedEnd: '', usageMode: 'single', totalAmount: 0, maxUses: 1 },
      festival: { name: '周年庆立减30', description: '周年庆期间使用，指定游戏和服务类型可用。', calcMethod: 'fixed', amount: 30, threshold: 200, discountRate: 0, maxDiscount: 0, eligibility: 'unlimited', sceneTags: ['节日'], validityMode: 'fixed', validDays: 0, fixedStart: '2026-11-01', fixedEnd: '2026-11-11', usageMode: 'single', totalAmount: 30, maxUses: 1 },
      custom: { name: '', description: '', calcMethod: 'fixed', amount: 20, threshold: 0, discountRate: 0, maxDiscount: 0, eligibility: 'unlimited', sceneTags: [], validityMode: 'relative', validDays: 7, fixedStart: '', fixedEnd: '', usageMode: 'single', totalAmount: 20, maxUses: 1 }
    };
    return clone(presets[preset] || presets.new);
  }

  function dashboardRangeFactor(range) { return { all: 1, yesterday: .16, today: .18, '7d': .56, '30d': 1 }[range] || 1; }
  function dashboardRangeWindow(range) {
    return {
      yesterday: ['2026-09-13', '2026-09-13'],
      today: ['2026-09-14', '2026-09-14'],
      '7d': ['2026-09-08', '2026-09-14'],
      '30d': ['2026-08-16', '2026-09-14'],
      all: ['', '']
    }[range] || ['', ''];
  }
  function dashboardRecordDate(value) { return String(value || '').slice(0, 10); }
  function dashboardConfigSourceKey(config) { return Object.entries(SOURCE_LABELS).find(([, label]) => label === config?.sourceSnapshot)?.[0] || ''; }
  function dashboardActivityGroupMatches(activity, group) { return group === 'all' || (group === 'recharge' ? activity?.type === 'recharge' : activity?.type !== 'recharge'); }
  function dashboardActivityTypeOptions(group) {
    const options = [['new_customer', ACTIVITY_TYPES.new_customer], ['claim', ACTIVITY_TYPES.claim]];
    if (group === 'recharge') return [['recharge', ACTIVITY_TYPES.recharge]];
    if (group === 'other') return [['all', '全部活动类型'], ...options];
    return [['all', '全部活动类型'], ['recharge', ACTIVITY_TYPES.recharge], ...options];
  }
  function dashboardActivityMatches(activity, filter = state.ui.dashboardFilter) {
    return dashboardActivityGroupMatches(activity, filter.activityGroup || 'all') && (filter.activityType === 'all' || !filter.activityType || activity?.type === filter.activityType);
  }
  function dashboardFilterOptionSets(filter = state.ui.dashboardFilter) {
    const configs = state.couponConfigs;
    const activities = state.activities.filter(activity => activity?.type === 'new_customer' || activity?.type === 'recharge' || activity?.type === 'claim');
    const scopedActivityIds = new Set(activities.filter(activity => dashboardActivityMatches(activity, filter)).map(activity => activity.id));
    const matchingConfigs = ({ ignoreActivity = false, ignoreCoupon = false, ignoreSource = false } = {}) => configs.filter(config => {
      if (!ignoreActivity && !(config.activityIds || []).some(activityId => scopedActivityIds.has(activityId))) return false;
      if (!ignoreCoupon && filter.coupon !== 'all' && config.id !== filter.coupon) return false;
      if (!ignoreSource && filter.source !== 'all' && dashboardConfigSourceKey(config) !== filter.source) return false;
      return true;
    });
    return {
      activities: activities.filter(activity => dashboardActivityMatches(activity, filter)).filter(activity => matchingConfigs({ ignoreActivity: true }).some(config => (config.activityIds || []).includes(activity.id))),
      coupons: matchingConfigs({ ignoreCoupon: true }),
      sources: Object.keys(SOURCE_LABELS).filter(source => matchingConfigs({ ignoreSource: true }).some(config => dashboardConfigSourceKey(config) === source))
    };
  }
  function normalizeDashboardFilter() {
    const filter = state.ui.dashboardFilter;
    let changed = true;
    while (changed) {
      changed = false;
      const options = dashboardFilterOptionSets(filter);
      if (!['all', 'recharge', 'other'].includes(filter.activityGroup)) { filter.activityGroup = 'all'; changed = true; }
      const activityTypes = dashboardActivityTypeOptions(filter.activityGroup).map(([key]) => key);
      if (!activityTypes.includes(filter.activityType)) { filter.activityType = filter.activityGroup === 'recharge' ? 'recharge' : 'all'; changed = true; }
      if (filter.coupon !== 'all' && !options.coupons.some(item => item.id === filter.coupon)) { filter.coupon = 'all'; changed = true; }
      if (filter.source !== 'all' && !options.sources.includes(filter.source)) { filter.source = 'all'; changed = true; }
    }
  }
  function dashboardDimensionFactor() {
    const filter = state.ui.dashboardFilter;
    let factor = 1;
    if (filter.activityGroup !== 'all') factor *= .42;
    if (filter.activityType !== 'all' && filter.activityGroup === 'all') factor *= .72;
    if (filter.coupon !== 'all') factor *= .66;
    if (filter.source !== 'all') factor *= .58;
    return factor;
  }
  function dashboardValues() {
    const base = state.metrics;
    const factor = dashboardRangeFactor(state.ui.dashboardFilter.range) * dashboardDimensionFactor();
    return {
      issued: Math.max(0, Math.round(base.instances * factor)),
      usageCount: Math.max(0, Math.round(base.usageCount * factor)),
      redeemedInstances: Math.max(0, Math.round(base.redeemedInstances * factor)),
      discount: Math.max(0, Math.round(base.discount * factor))
    };
  }
  function dashboardActivityRows(values) {
    const filter = state.ui.dashboardFilter;
    const activities = state.activities.filter(activity => activity?.type === 'new_customer' || activity?.type === 'recharge' || activity?.type === 'claim').filter(activity => dashboardActivityMatches(activity, filter)).filter(activity => state.couponConfigs.some(config => {
      if (!(config.activityIds || []).includes(activity.id)) return false;
      if (filter.coupon !== 'all' && config.id !== filter.coupon) return false;
      if (filter.source !== 'all' && dashboardConfigSourceKey(config) !== filter.source) return false;
      return true;
    }));
    const weights = activities.map(activity => ({ activity, weight: Math.max(1, state.couponConfigs.filter(config => (config.activityIds || []).includes(activity.id) && (filter.coupon === 'all' || config.id === filter.coupon) && (filter.source === 'all' || dashboardConfigSourceKey(config) === filter.source)).reduce((sum, config) => sum + num(config.issuedCount), 0)) }));
    const selectedActivity = filter.activity !== 'all' ? weights.find(item => item.activity.id === filter.activity) : null;
    const visible = selectedActivity ? [selectedActivity] : weights;
    const denominator = selectedActivity ? selectedActivity.weight : Math.max(1, weights.reduce((sum, item) => sum + item.weight, 0));
    return visible.map(({ activity, weight }) => {
      const share = selectedActivity ? 1 : weight / denominator;
      const issued = Math.round(values.issued * share);
      const redeemedInstances = Math.round(values.redeemedInstances * share);
      const relatedConfigs = state.couponConfigs.filter(config => (config.activityIds || []).includes(activity.id) && (filter.coupon === 'all' || config.id === filter.coupon) && (filter.source === 'all' || dashboardConfigSourceKey(config) === filter.source));
      const couponNames = [...new Set(relatedConfigs.map(config => config.name).filter(Boolean))].join('、') || '—';
      const sources = [...new Set(relatedConfigs.map(config => dashboardConfigSourceKey(config)).filter(Boolean))].map(sourceLabel).join('、') || '—';
      const totalIssued = relatedConfigs.reduce((sum, config) => sum + Math.max(0, num(config.issuedCount, 0)), 0);
      const inventory = relatedConfigs.reduce((sum, config) => sum + Math.max(0, num(config.availableCount, 0)), 0);
      return { activity, couponNames, sources, issued, totalIssued, inventory, usageCount: Math.round(values.usageCount * share), redeemedInstances, rate: issued ? Math.round(redeemedInstances / issued * 100) : 0, discount: Math.round(values.discount * share) };
    });
  }
  function dashboardActivityDetailRows(activityId) {
    const filter = state.ui.dashboardFilter;
    const activity = getActivity(activityId);
    if (!activity) return [];
    const activityRow = dashboardActivityRows(dashboardValues()).find(row => row.activity.id === activityId);
    if (!activityRow) return [];
    const configs = state.couponConfigs.filter(config => (config.activityIds || []).includes(activityId) && (filter.coupon === 'all' || config.id === filter.coupon) && (filter.source === 'all' || dashboardConfigSourceKey(config) === filter.source));
    const totalWeight = Math.max(1, configs.reduce((sum, config) => sum + num(config.issuedCount), 0));
    const seen = new Set();
    return configs.map(config => {
      const tuple = `${activityId}:${config.id}:${dashboardConfigSourceKey(config)}`;
      if (seen.has(tuple)) return null;
      seen.add(tuple);
      const share = num(config.issuedCount) / totalWeight;
      const issued = Math.round(activityRow.issued * share);
      const redeemedInstances = Math.round(activityRow.redeemedInstances * share);
      return { activity, couponName: config.name || '—', source: sourceLabel(dashboardConfigSourceKey(config)), totalIssued: Math.max(0, num(config.issuedCount, 0)), inventory: Math.max(0, num(config.availableCount, 0)), issued, usageCount: Math.round(activityRow.usageCount * share), rate: issued ? Math.round(redeemedInstances / issued * 100) : 0, discount: Math.round(activityRow.discount * share) };
    }).filter(Boolean);
  }
  function renderDashboardActivityInlineDetails(activityId) {
    const rows = dashboardActivityDetailRows(activityId);
    const activity = getActivity(activityId);
    if (!activity) return '';
    return rows.length ? rows.map(row => `<tr class="dashboard-inline-detail-row"><td><strong>${esc(row.activity.name)}</strong></td><td><strong>${esc(row.couponName)}</strong></td><td>${esc(row.source)}</td><td aria-hidden="true"></td><td>${int(row.totalIssued)} 张</td><td>${int(row.inventory)} 张</td><td>${int(row.issued)} 张</td><td>${int(row.usageCount)} 次</td><td><span class="activity-rate">${row.rate}%</span></td><td>${money(row.discount)}</td></tr>`).join('') : `<tr class="dashboard-inline-detail-row"><td colspan="10">${emptyState('暂无关联明细', '当前筛选条件下没有可展示的优惠券和触发方式。')}</td></tr>`;
  }
  function dashboardRecordMatches(record, filter = state.ui.dashboardFilter, window = dashboardRangeWindow(filter.range)) {
    if (filter.activity !== 'all' && record.activityId !== filter.activity) return false;
    if (filter.source !== 'all' && record.source !== filter.source) return false;
    if (filter.coupon !== 'all') {
      const config = getCouponConfig(filter.coupon);
      const instance = record.couponInstanceId ? getCoupon(record.couponInstanceId) : null;
      if (!((record.couponConfigId === filter.coupon) || (instance?.couponConfigId === filter.coupon) || (config && getTemplateFromRecord(record)?.id === config.templateId))) return false;
    }
    const date = dashboardRecordDate(record.createdAt);
    return !window?.[0] || (date >= window[0] && date <= window[1]);
  }
  function dashboardTrendSets() {
    return {
      yesterday: [{ label: '昨天', value: 50, start: '2026-09-13', end: '2026-09-13' }],
      today: [{ label: '今天', value: 56, start: '2026-09-14', end: '2026-09-14' }],
      '7d': [{ label: '09/08', value: 18, start: '2026-09-08', end: '2026-09-08' }, { label: '09/09', value: 22, start: '2026-09-09', end: '2026-09-09' }, { label: '09/10', value: 24, start: '2026-09-10', end: '2026-09-10' }, { label: '09/11', value: 27, start: '2026-09-11', end: '2026-09-11' }, { label: '09/12', value: 31, start: '2026-09-12', end: '2026-09-12' }, { label: '09/13', value: 29, start: '2026-09-13', end: '2026-09-13' }, { label: '09/14', value: 24, start: '2026-09-14', end: '2026-09-14' }],
      '30d': [{ label: '08/16-08/22', value: 54, start: '2026-08-16', end: '2026-08-22' }, { label: '08/23-08/29', value: 61, start: '2026-08-23', end: '2026-08-29' }, { label: '08/30-09/05', value: 68, start: '2026-08-30', end: '2026-09-05' }, { label: '09/06-09/12', value: 77, start: '2026-09-06', end: '2026-09-12' }, { label: '09/13-09/14', value: 53, start: '2026-09-13', end: '2026-09-14' }]
    };
  }
  function renderDashboard() {
    normalizeDashboardFilter();
    const filter = state.ui.dashboardFilter;
    const filterOptions = dashboardFilterOptionSets(filter);
    const values = dashboardValues();
    const rate = values.issued ? Math.round(values.redeemedInstances / values.issued * 100) : 0;
    const rangeLabels = { all: '全部', yesterday: '昨天', today: '今天', '7d': '近7天', '30d': '近30天' };
    const rangeLabel = rangeLabels[filter.range] || '近30天';
    const dimensionFactor = dashboardDimensionFactor();
    const usageRatio = values.issued ? values.usageCount / values.issued : 0;
    const chart = (dashboardTrendSets()[filter.range] || dashboardTrendSets()['30d']).map((item, index) => {
      const issued = Math.max(0, Math.round(item.value * dimensionFactor));
      const pointRate = Math.max(0, Math.min(100, rate + [-2, 1, 2, -1, 0, 2, -1][index % 7]));
      return { ...item, issued, usageCount: Math.max(0, Math.round(issued * usageRatio)), rate: pointRate };
    });
    const maxIssued = Math.max(1, ...chart.map(item => item.issued));
    const maxUsage = Math.max(1, ...chart.map(item => item.usageCount));
    const maxRate = Math.max(1, ...chart.map(item => item.rate));
    const sourceBase = [{ key: 'new_customer', label: '新客自动发', value: 128 }, { key: 'recharge', label: '充值送券', value: 91 }, { key: 'claim', label: '主动领取', value: 73 }, { key: 'manual', label: '人工发券', value: 14 }, { key: 'cdk', label: 'CDK兑换', value: 6 }];
    const sourceRows = sourceBase.map(row => ({ ...row, value: filter.source === 'all' || filter.source === row.key ? Math.round(row.value * dashboardRangeFactor(filter.range) * dimensionFactor) : 0 })).map(row => ({ ...row, width: row.value ? Math.round(row.value / Math.max(1, ...sourceBase.map(item => filter.source === 'all' || filter.source === item.key ? Math.round(item.value * dashboardRangeFactor(filter.range) * dimensionFactor) : 0)) * 100) : 0 }));
    const activityRows = dashboardActivityRows(values);
    const dashboardActivityPageSize = 5;
    const dashboardActivityPageCount = Math.max(1, Math.ceil(activityRows.length / dashboardActivityPageSize));
    const dashboardActivityPage = Math.min(Math.max(1, Number(state.ui.dashboardActivityPage) || 1), dashboardActivityPageCount);
    state.ui.dashboardActivityPage = dashboardActivityPage;
    const dashboardActivityPageRows = activityRows.slice((dashboardActivityPage - 1) * dashboardActivityPageSize, dashboardActivityPage * dashboardActivityPageSize);
    const dashboardActivityPagination = activityRows.length ? `<div class="pagination dashboard-activity-pagination"><div class="pagination-pages"><button class="page-arrow" data-action="dashboard-activity-page-prev" data-page="${dashboardActivityPage - 1}"${dashboardActivityPage <= 1 ? ' disabled' : ''} aria-label="上一页">‹</button>${Array.from({ length: dashboardActivityPageCount }, (_, index) => index + 1).map(number => `<button class="page-number${number === dashboardActivityPage ? ' active' : ''}" data-action="dashboard-activity-page-number" data-page="${number}"${number === dashboardActivityPage ? ' aria-current="page"' : ''}>${number}</button>`).join('')}<button class="page-arrow" data-action="dashboard-activity-page-next" data-page="${dashboardActivityPage + 1}"${dashboardActivityPage >= dashboardActivityPageCount ? ' disabled' : ''} aria-label="下一页">›</button></div></div>` : '';
    const rangeText = rangeLabels[filter.range] || '近30天';
    const dashboardActivityGroups = [['all', '全部活动'], ['recharge', '储值活动'], ['other', '常规活动']];
    const activityTypeOptions = dashboardActivityTypeOptions(filter.activityGroup);
    const dashboardRecordsButton = '';
    return `${pageHeading('优惠券管理中心 / 数据与记录', '优惠券看板', '按当前俱乐部查看优惠券从发放、到账到核销的日常表现。', dashboardRecordsButton)}
      <div class="card dashboard-filter"><div class="dashboard-filter-main"><span class="filter-label">筛选</span><div class="time-pills">${[['yesterday', '昨天'], ['today', '今天'], ['7d', '近7天'], ['30d', '近30天']].map(([key, label]) => `<button class="time-pill${filter.range === key ? ' active' : ''}" data-action="dashboard-range" data-value="${key}">${label}</button>`).join('')}</div><select class="filter-select" data-filter="dashboard-activity-group" aria-label="活动范围">${dashboardActivityGroups.map(([key, label]) => `<option value="${key}"${selected(filter.activityGroup, key)}>${label}</option>`).join('')}</select><span class="filter-label dashboard-activity-type-label">活动类型</span><select class="filter-select" data-filter="dashboard-activity-type" aria-label="活动类型"${filter.activityGroup === 'recharge' ? ' disabled' : ''}>${activityTypeOptions.map(([key, label]) => `<option value="${key}"${selected(filter.activityType, key)}>${label}</option>`).join('')}</select><select class="filter-select" data-filter="dashboard-coupon"><option value="all">全部优惠券</option>${filterOptions.coupons.map(item => `<option value="${item.id}"${selected(filter.coupon, item.id)}>${esc(item.name)}</option>`).join('')}</select><select class="filter-select" data-filter="dashboard-source"><option value="all">全部触发方式</option>${filterOptions.sources.map(key => `<option value="${key}"${selected(filter.source, key)}>${SOURCE_LABELS[key]}</option>`).join('')}</select></div><div class="dashboard-filter-actions"><span class="subtle">数据范围：${esc(CLUB.name)}</span><span class="dashboard-updated">数据更新于 ${esc(state.ui.dashboardLastUpdated || '2026-09-14 18:00')}</span><button class="btn btn-secondary btn-small" type="button" data-action="dashboard-refresh">刷新</button></div></div>
      <div class="stats-grid dashboard-core-stats"><button type="button" class="card stat-card teal dashboard-drill-card" data-action="dashboard-metric" data-record-type="grant"><div class="stat-label"><i></i>实际到账券数</div><div class="stat-value"><strong>${int(values.issued)}</strong><span>张</span></div><div class="stat-foot">成功生成的优惠券实例 · 点击查看发放记录</div></button><button type="button" class="card stat-card orange dashboard-drill-card" data-action="dashboard-metric" data-record-type="usage"><div class="stat-label"><i></i>核销次数</div><div class="stat-value"><strong>${int(values.usageCount)}</strong><span>次</span></div><div class="stat-foot">每次消费核销均计数 · 点击查看核销流水</div></button><button type="button" class="card stat-card purple dashboard-drill-card" data-action="dashboard-metric" data-record-type="usage"><div class="stat-label"><i></i>实例核销率</div><div class="stat-value"><strong>${rate}%</strong></div><div class="stat-foot">核销实例 ÷ 实际到账实例 · 点击查看核销流水</div></button><button type="button" class="card stat-card purple dashboard-drill-card" data-action="dashboard-metric" data-record-type="usage"><div class="stat-label"><i></i>实际优惠金额</div><div class="stat-value"><strong>${money(values.discount)}</strong></div><div class="stat-foot">核销记录中的实际优惠金额 · 点击查看核销流水</div></button></div>
      <div class="dashboard-grid"><div><div class="card chart-box"><div class="chart-title"><h3>${rangeLabel}趋势</h3><span>三项统计系列 · ${chart.length} 个数据点</span></div><div class="chart-series-legend"><span><i class="series-issued"></i>实际到账券数</span><span><i class="series-usage"></i>核销次数</span><span><i class="series-rate"></i>核销率</span></div><div class="bar-chart chart-series">${chart.map(item => `<div class="chart-col chart-point"><div class="chart-series-bars"><button type="button" class="chart-series-bar" data-action="dashboard-trend-point" data-start="${item.start}" data-end="${item.end}" data-record-type="grant" title="实际到账券数 ${item.issued}"><em>${item.issued}</em><span class="chart-bar series-issued" style="height:${Math.round(item.issued / maxIssued * 132) + 8}px"></span></button><button type="button" class="chart-series-bar" data-action="dashboard-trend-point" data-start="${item.start}" data-end="${item.end}" data-record-type="usage" title="核销次数 ${item.usageCount}"><em>${item.usageCount}</em><span class="chart-bar series-usage" style="height:${Math.round(item.usageCount / maxUsage * 132) + 8}px"></span></button><button type="button" class="chart-series-bar" data-action="dashboard-trend-point" data-start="${item.start}" data-end="${item.end}" data-record-type="usage" title="核销率 ${item.rate}%"><em>${item.rate}%</em><span class="chart-bar series-rate" style="height:${Math.round(item.rate / maxRate * 132) + 8}px"></span></button></div><small>${item.label}</small></div>`).join('')}</div><div class="legend-note">三组数据按当前筛选条件同步更新；近30天按周汇总，昨天和今天按日汇总。点击对应系列查看记录。</div></div></div><div><div class="card chart-box"><div class="chart-title"><h3>触发方式</h3><span>实例数</span></div><div class="source-list">${sourceRows.map(row => `<button type="button" class="source-row" data-action="dashboard-source-drill" data-source="${row.key}" data-record-type="grant"><span>${row.label}</span><span class="source-track"><i style="width:${row.width}%"></i></span><strong>${row.value}</strong></button>`).join('')}</div><div class="legend-note">按触发方式统计实际到账券实例。点击触发方式查看对应发放记录。</div></div></div></div>
      <div class="card dashboard-activity-card"><div class="card-head"><div><h3>活动明细</h3><p>${rangeText} · 当前筛选条件下的活动汇总</p></div><span class="subtle">${activityRows.length} 个活动</span></div><div class="table-wrap dashboard-activity-table">${activityRows.length ? `<table><thead><tr><th>活动名称</th><th>优惠券名称</th><th>触发方式</th><th>状态</th><th>发放总量</th><th>库存</th><th>实际到账券数</th><th>核销次数</th><th>核销率</th><th>实际优惠金额</th></tr></thead><tbody>${dashboardActivityPageRows.map(row => { const expanded = state.ui.dashboardActivityExpanded === row.activity.id; return `<tr class="dashboard-activity-row${expanded ? ' expanded' : ''}" data-action="dashboard-activity-detail" data-id="${esc(row.activity.id)}" tabindex="0" aria-expanded="${expanded}"><td><strong>${esc(row.activity.name)}</strong></td><td>${esc(row.couponNames)}</td><td>${esc(row.sources)}</td><td>${statusChip(row.activity.status)}</td><td>${int(row.totalIssued)} 张</td><td>${int(row.inventory)} 张</td><td>${int(row.issued)} 张</td><td>${int(row.usageCount)} 次</td><td><span class="activity-rate">${row.rate}%</span></td><td>${money(row.discount)}<button type="button" class="dashboard-activity-toggle" data-action="dashboard-activity-detail" data-id="${esc(row.activity.id)}" aria-expanded="${expanded}" aria-label="${expanded ? '收起活动明细' : '展开活动明细'}">${expanded ? '⌃' : '⌄'}</button></td></tr>${expanded ? renderDashboardActivityInlineDetails(row.activity.id) : ''}`; }).join('')}</tbody></table>` : emptyState('暂无活动明细', '当前筛选条件下没有关联活动。')}</div>${dashboardActivityPagination}</div>`;
  }

  function recordDateMatches(record) {
    return recordDateMatchesFilter(record, state.ui.recordFilter);
  }
  function recordDateMatchesFilter(record, filter) {
    const date = dashboardRecordDate(record.createdAt);
    if (filter.dateStart && date < filter.dateStart) return false;
    if (filter.dateEnd && date > filter.dateEnd) return false;
    if (!filter.dateStart && !filter.dateEnd && filter.range && filter.range !== 'all') {
      const window = dashboardRangeWindow(filter.range);
      if (window[0] && (date < window[0] || date > window[1])) return false;
    }
    return true;
  }
  function recordCouponConfigId(record) {
    if (record?.couponConfigId) return record.couponConfigId;
    const instance = record?.couponInstanceId ? getCoupon(record.couponInstanceId) : null;
    return instance?.couponConfigId || '';
  }
  function recordCouponConfig(record) {
    const configId = recordCouponConfigId(record);
    return configId ? getCouponConfig(configId) : null;
  }
  function recordActivityIds(record) {
    const config = recordCouponConfig(record);
    return [...new Set([record?.activityId, ...(config?.activityIds || [])].filter(Boolean))];
  }
  function recordActivityName(record) {
    return getActivity(record?.activityId)?.name || '无关联活动';
  }
  function recordCouponName(record) {
    const config = recordCouponConfig(record);
    return config?.name || getTemplateFromRecord(record)?.name || '未关联优惠券';
  }
  function recordSearchText(record) {
    return [record.id, recordActivityName(record), recordCouponName(record)].filter(Boolean).join(' ').toLowerCase();
  }
  function recordCustomerSearchText(record) {
    return [record.customerId, record.customerName].filter(Boolean).join(' ').toLowerCase();
  }
  function recordMatchesFilter(record, filter, ignored = '') {
    const q = String(filter.q || '').trim().toLowerCase();
    const customer = String(filter.customer || '').trim().toLowerCase();
    if (ignored !== 'query' && q && !recordSearchText(record).includes(q)) return false;
    if (ignored !== 'customer' && customer && !recordCustomerSearchText(record).includes(customer)) return false;
    if (ignored !== 'status' && filter.status !== 'all' && record.status !== filter.status) return false;
    if (ignored !== 'source' && filter.source !== 'all' && record.source !== filter.source) return false;
    if (ignored !== 'activity' && filter.activityId && !recordActivityIds(record).includes(filter.activityId)) return false;
    if (ignored !== 'coupon' && filter.couponConfigId && recordCouponConfigId(record) !== filter.couponConfigId) return false;
    return ignored === 'date' || recordDateMatchesFilter(record, filter);
  }
  function recordFilterOptionSets(tab = state.ui.recordTab) {
    const base = state.records.filter(record => record.recordType === tab);
    const filter = state.ui.recordFilter;
    const matching = ignored => base.filter(record => recordMatchesFilter(record, filter, ignored));
    const activityIds = new Set(matching('activity').flatMap(record => recordActivityIds(record)));
    const couponIds = new Set(matching('coupon').map(record => recordCouponConfigId(record)).filter(Boolean));
    const sources = [...new Set(matching('source').map(record => record.source).filter(Boolean))];
    const hasRelationFilter = Boolean(filter.activityId || filter.couponConfigId || filter.source !== 'all');
    return {
      activities: hasRelationFilter ? state.activities.filter(activity => activityIds.has(activity.id)) : state.activities,
      coupons: hasRelationFilter ? state.couponConfigs.filter(config => couponIds.has(config.id)) : state.couponConfigs,
      sources
    };
  }
  function reconcileRecordFilters(tab = state.ui.recordTab) {
    const filter = state.ui.recordFilter;
    const options = recordFilterOptionSets(tab);
    if (filter.activityId && !options.activities.some(item => item.id === filter.activityId)) filter.activityId = '';
    if (filter.couponConfigId && !options.coupons.some(item => item.id === filter.couponConfigId)) filter.couponConfigId = '';
    if (filter.source !== 'all' && !options.sources.includes(filter.source)) filter.source = 'all';
  }
  function recordContextLabel(filter) {
    if (filter.dateStart || filter.dateEnd) return `${formatDate(filter.dateStart)} 至 ${formatDate(filter.dateEnd)}`;
    return { all: '全部', yesterday: '昨天', today: '今天', '7d': '近7天', '30d': '近30天' }[filter.range] || '';
  }
  function recordsForTab(tab) {
    const filter = state.ui.recordFilter;
    return state.records.filter(record => {
      const matchesTab = record.recordType === tab;
      return matchesTab && recordMatchesFilter(record, filter);
    });
  }
  function recordTypeLabel(type) { return { grant: '发放', claim: '领取', usage: '核销' }[type] || type; }
  function renderRecords(tab) {
    state.ui.recordTab = ['grant', 'claim', 'usage'].includes(tab) ? tab : 'grant';
    reconcileRecordFilters(state.ui.recordTab);
    const filter = state.ui.recordFilter;
    const records = recordsForTab(state.ui.recordTab);
    const filterOptions = recordFilterOptionSets(state.ui.recordTab);
    const tabs = [['grant', '发放记录'], ['claim', '领取记录'], ['usage', '核销流水']];
    const statusOptions = state.ui.recordTab === 'grant' || state.ui.recordTab === 'claim' ? [['success', '成功'], ['failed', '失败']] : [['consumed', '已核销'], ['released', '已释放'], ['rolled_back', '已回退']];
    if (filter.status !== 'all' && !statusOptions.some(([key]) => key === filter.status)) filter.status = 'all';
    const activity = filter.activityId ? getActivity(filter.activityId) : null;
    const couponConfig = filter.couponConfigId ? getCouponConfig(filter.couponConfigId) : null;
    const contextRange = recordContextLabel(filter);
    const dashboardContext = filter.fromDashboard ? `<div class="info-banner dashboard-context-banner"><span>⌁</span><div>来自优惠券看板：${esc(contextRange || '当前筛选')} · ${activity ? `活动：${esc(activity.name)}` : '全部活动'} · ${couponConfig ? `优惠券：${esc(couponConfig.name)}` : '全部优惠券'} · ${filter.source !== 'all' ? `触发方式：${esc(sourceLabel(filter.source))}` : '全部触发方式'} · 点击“返回优惠券看板”可继续调整筛选。</div></div>` : '';
    const rangePills = [['yesterday', '昨天'], ['today', '今天'], ['7d', '近7天'], ['30d', '近30天'], ['all', '全部']].map(([key, label]) => `<button type="button" class="time-pill${filter.range === key && !filter.dateStart && !filter.dateEnd ? ' active' : ''}" data-action="record-range" data-value="${key}">${label}</button>`).join('');
    const activityOptions = filterOptions.activities.map(item => `<option value="${item.id}"${selected(filter.activityId, item.id)}>${esc(item.name)}</option>`).join('');
    const couponOptions = filterOptions.coupons.map(item => `<option value="${item.id}"${selected(filter.couponConfigId, item.id)}>${esc(item.name)}</option>`).join('');
    const sourceOptions = filterOptions.sources.map(key => `<option value="${key}"${selected(filter.source, key)}>${esc(SOURCE_LABELS[key])}</option>`).join('');
    return `${pageHeading('优惠券管理中心 / 数据与记录', '发放与核销记录', '按活动、优惠券和触发方式追溯每条发放、领取与核销事件。', '<button class="btn btn-secondary" data-route="dashboard">← 返回优惠券看板</button>')}${dashboardContext}<div class="card record-filter-card"><div class="record-filter-row"><span class="filter-label">时间</span><div class="time-pills record-range-pills">${rangePills}</div><div class="record-date-range"><input type="date" aria-label="开始日期" data-filter="record-date-start" value="${esc(filter.dateStart)}"><span>至</span><input type="date" aria-label="结束日期" data-filter="record-date-end" value="${esc(filter.dateEnd)}"></div></div><div class="record-filter-row"><span class="filter-label">关联</span><select class="filter-select" data-filter="record-activity"><option value="">全部活动</option>${activityOptions}</select><select class="filter-select" data-filter="record-coupon"><option value="">全部优惠券</option>${couponOptions}</select><select class="filter-select" data-filter="record-source"><option value="all">全部触发方式</option>${sourceOptions}</select><select class="filter-select" data-filter="record-status"><option value="all">全部状态</option>${statusOptions.map(([key, label]) => `<option value="${key}"${selected(filter.status, key)}>${label}</option>`).join('')}</select><button type="button" class="btn btn-secondary btn-small" data-action="record-filter-reset">重置筛选</button></div><div class="record-search-grid"><form class="record-search-form" data-search="records"><div class="search-box"><span class="search-icon">⌕</span><input name="q" value="${esc(filter.q)}" placeholder="搜索记录ID、活动或优惠券"></div><button class="btn btn-secondary btn-small" type="submit">查询</button></form><form class="record-customer-search-form" data-search="record-customer"><div class="search-box"><span class="search-icon">⌕</span><input name="customer" value="${esc(filter.customer)}" placeholder="搜索顾客"></div><button class="btn btn-secondary btn-small" type="submit">查询</button></form></div></div>${activity ? `<div class="info-banner"><span>⌁</span><div>当前活动：<strong>${esc(activity.name)}</strong> · <button class="btn-text" data-action="clear-record-activity">清除活动筛选</button></div></div>` : ''}${couponConfig ? `<div class="info-banner"><span>⌁</span><div>当前优惠券：<strong>${esc(couponConfig.name)}</strong> · <button class="btn-text" data-action="clear-record-coupon">清除优惠券筛选</button></div></div>` : ''}<div class="card record-list-card"><div class="toolbar record-toolbar"><div class="record-tabs">${tabs.map(([key, label]) => `<button class="record-tab${state.ui.recordTab === key ? ' active' : ''}" data-action="record-tab" data-tab="${key}">${label}<span class="record-tab-count">${state.records.filter(item => item.recordType === key).length}</span></button>`).join('')}</div><span class="record-result-count">共 ${records.length} 条</span></div><div class="table-wrap">${records.length ? `<table class="records-table"><thead><tr><th>记录 ID</th><th>活动名称</th><th>优惠券名称</th><th>触发方式</th><th>顾客</th><th>订单/券实例</th><th>状态</th><th>结果摘要</th><th>时间</th><th style="text-align:right;">操作</th></tr></thead><tbody>${records.map(renderRecordRow).join('')}</tbody></table>` : emptyState('暂无符合条件的记录', '可以调整活动、优惠券、触发方式、状态或时间条件。')}</div></div>`;
  }
  function renderRecordRow(record) {
    const activity = getActivity(record.activityId);
    const orderOrInstance = `${record.orderId || '-'} / ${record.couponInstanceId || '-'}`;
    return `<tr><td><span class="record-id">${esc(record.id)}</span><small class="record-type-label">${esc(recordTypeLabel(record.recordType))}</small></td><td>${esc(activity?.name || '无关联活动')}</td><td>${esc(recordCouponName(record))}</td><td>${esc(sourceLabel(record.source))}</td><td>${esc(record.customerId || '-')}</td><td><div class="cell-stack"><strong>${esc(record.orderId || '-')}</strong><small>${esc(record.couponInstanceId || '-')}</small></div></td><td>${statusChip(record.status)}</td><td><div class="cell-stack"><strong>${esc(record.summary || '-')}</strong><small>${esc(record.message || '')}</small></div></td><td>${esc(record.createdAt)}</td><td><div class="action-group"><button class="btn-text" data-action="record-detail" data-id="${record.id}">详情</button></div></td></tr>`;
  }

  function renderSharedTemplateModal(id) {
    const template = templateDraftFor(id);
    state.ui.templateDraft = template;
    const draft = { ...blankCouponDraft(), ...clone(template), id: '', templateId: '', ruleId: '', activityIds: [], stackable: Boolean(template.stackable), scopeSelections: clone(template.scopeSelections || [{ game: '', category: '', product: '' }]) };
    const basicInfo = renderCouponBasicInfo(draft).replaceAll('优惠券名称', '券模板名称');
    const title = id ? '编辑券模板' : '新建券模板';
    const description = '使用与新增优惠券一致的字段配置可复用优惠规则，保存后返回模板列表。';
    const previewValue = draft.calcMethod === 'discount' ? `${num(draft.discountRate) / 10} 折` : `¥${num(draft.amount)}`;
    const previewType = draft.calcMethod === 'discount' ? '折扣券' : '定额券';
    const previewThreshold = draft.calcMethod === 'discount' || num(draft.threshold) > 0 ? `满${num(draft.threshold)}元可用` : '无门槛';
    const preview = `<aside class="preview-panel"><div class="card preview-card coupon-preview-card"><div class="preview-label">优惠券配置预览</div><div class="preview-value${draft.calcMethod === 'discount' ? ' discount' : ''}">${esc(previewValue)}<small>${draft.calcMethod === 'discount' ? `最高优惠 ${num(draft.maxDiscount)} 元` : '固定减免'}</small></div><div class="preview-title">${esc(draft.name || '未命名优惠券')}</div><div class="preview-divider"></div><div class="preview-row"><span>优惠券类型</span><strong>${esc(previewType)}</strong></div><div class="preview-row"><span>优惠券描述</span><strong>${esc(draft.description || '—')}</strong></div><div class="preview-row"><span>使用门槛</span><strong>${esc(previewThreshold)}</strong></div><div class="preview-row"><span>用户资格</span><strong>${esc(eligibilitySummary(draft))}</strong></div><div class="preview-row"><span>适用范围</span><strong>${esc(scopeSummary(draft))}</strong></div><div class="preview-row"><span>有效期</span><strong>${esc(validitySummary(draft))}</strong></div><div class="preview-row"><span>使用方式</span><strong>${esc(usageSummary(draft))}</strong></div><div class="preview-row"><span>可叠加</span><strong>${draft.stackable ? '是' : '否'}</strong></div></div></aside>`;
    return `<div class="modal-backdrop modal-centered"><div class="coupon-create-modal template-modal" role="dialog" aria-modal="true" aria-labelledby="template-modal-title"><form data-form="template-modal" data-id="${esc(id || '')}"><div class="coupon-create-modal-head template-modal-head"><div><span class="section-kicker">优惠券管理 / 券模板列表</span><h2 id="template-modal-title">${title}</h2><p>${description}</p></div><button type="button" class="close-button" data-action="close-modal" aria-label="关闭">×</button></div><div class="coupon-create-modal-body template-modal-body"><div class="split-layout coupon-create-layout"><div class="coupon-create-main">${renderCouponTypeChooser(draft, [], 'template')}${basicInfo}${renderCouponAdvancedSettings(draft, 'template')}</div>${preview}</div></div><div class="template-modal-foot"><button type="button" class="btn btn-secondary" data-action="close-modal">取消</button><button type="submit" class="btn btn-primary">保存模板</button></div></form></div></div>`;
  }

 function renderModal() {
    const modal = state.ui.modal;
    if (!modal) return '';
    if (modal.type === 'record') return renderRecordDrawerEnhanced(getRecord(modal.id)).replace('<div class="modal-backdrop"><aside class="drawer">', '<div class="modal-backdrop modal-centered record-detail-backdrop"><div class="record-detail-modal">').replace('</aside></div>', '</div></div>');
    if (modal.type === 'template-form') return renderSharedTemplateModal(modal.id);
    if (modal.type === 'activity-form') return renderActivityForm(modal.id || '', modal.variant || 'stored');
    if (modal.type === 'activity-detail') return renderActivityDetailModal(modal.id);
    if (modal.type === 'cdk-detail') return renderCdkDetailModal(modal.id);
    if (modal.type === 'cdk-batch-form') return renderCdkBatchForm();
    if (modal.type === 'coupon-form') return renderCouponCreateModal(modal.id || '');
    if (modal.type === 'coupon-publish-confirm') return `${renderCouponCreateModal(state.ui.couponDraft?.id || '')}<div class="modal-backdrop modal-centered"><div class="confirm-card"><button type="button" class="close-button" data-action="coupon-publish-dismiss" aria-label="关闭">×</button><h2>是否另存为模板？</h2><p>保存并发布前，可以将当前优惠券配置另存为自定义券模板，方便后续复用。</p><div class="confirm-actions"><button class="btn btn-secondary" data-action="coupon-publish-without-template">直接保存并发布</button><button class="btn btn-primary" data-action="coupon-publish-with-template">另存为模板并发布</button></div></div></div>`;
    if (modal.type === 'manual-grant') { const config = getCouponConfig(modal.id); const template = couponConfigTemplate(config); return `<div class="modal-backdrop modal-centered"><div class="confirm-card manual-grant-modal"><div class="drawer-head"><div><span class="section-kicker">人工发券规则</span><h2>执行人工发券</h2><p>${esc(config?.name || '优惠券配置')} · ${esc(template ? ruleSummary(template) : '')}</p></div><button class="close-button" data-action="close-modal">×</button></div><form data-form="manual-grant" style="margin-top:16px;"><div class="field"><label>顾客 ID / 手机号<em>*</em></label><input name="customerId" placeholder="例如：CUS-10089"></div><div class="field" style="margin-top:14px;"><label>发放数量<em>*</em></label><div class="input-suffix"><input type="number" min="1" max="99" name="quantity" value="1"><span>张，单次最多 99 张</span></div></div><div class="field" style="margin-top:14px;"><label>执行备注</label><textarea name="note" placeholder="可填写补发原因或客服工单号"></textarea></div><div class="notice" style="margin-top:15px;"><span>i</span><div>提交后才生成顾客券实例，并写入人工发券流水；配置本身不会被改变。</div></div><div class="confirm-actions"><button type="button" class="btn btn-secondary" data-action="close-modal">取消</button><button type="submit" class="btn btn-primary">确认发券</button></div></form></div></div>`; }
    if (modal.type === 'confirm') return `<div class="modal-backdrop modal-centered"><div class="confirm-card"><h2>${esc(modal.title)}</h2><p>${esc(modal.description)}</p><div class="confirm-actions"><button class="btn btn-secondary btn-small" data-action="close-modal">取消</button><button class="btn ${modal.danger ? 'btn-danger' : 'btn-primary'} btn-small" data-action="confirm-modal">确认</button></div></div></div>`;
    if (modal.type === 'rules') return `<div class="modal-backdrop modal-centered"><div class="confirm-card" style="width:min(620px,100%);"><div class="drawer-head" style="padding-bottom:13px;"><div><h2>一期优惠券规则口径</h2><p>本原型中的统一展示规则</p></div><button class="close-button" data-action="close-modal">×</button></div><div class="definition-list" style="grid-template-columns:1fr;margin-top:14px;"><div class="definition-item"><b>优惠计算</b><span>固定减免 / 折扣；“满减”只代表固定减免 + 使用门槛。</span></div><div class="definition-item"><b>券与模板</b><span>券模板是可复用规则；优惠券是基于模板生成、发给顾客的独立券实例。</span></div><div class="definition-item"><b>顾客资格</b><span>首单 / 不限；新客发放触发和首单核销判断分离。</span></div><div class="definition-item"><b>券生命周期</b><span>可用、占用、已使用、已过期、已失效。</span></div><div class="definition-item"><b>数据口径</b><span>核销率按券实例计算；核销次数单独统计多次使用行为。</span></div><div class="definition-item"><b>充值退款</b><span>未使用赠券失效；已使用赠券按实际优惠额 × 退款比例扣减退款，扣减不足则阻断退款。</span></div><div class="definition-item"><b>数据权限</b><span>俱乐部管理员只能操作当前俱乐部，页面固定 ${esc(CLUB.name)}。</span></div></div><div class="confirm-actions"><button class="btn btn-primary btn-small" data-action="close-modal">知道了</button></div></div></div>`;
    return '';
  }
  function getTemplateFromRecord(record) {
    const config = record?.couponConfigId ? getCouponConfig(record.couponConfigId) : recordCouponConfig(record);
    if (config) return couponConfigTemplate(config);
    const instance = record?.couponInstanceId ? getCoupon(record.couponInstanceId) : null;
    const instanceConfig = instance?.couponConfigId ? getCouponConfig(instance.couponConfigId) : null;
    if (instanceConfig) return couponConfigTemplate(instanceConfig);
    return state.templates.find(template => record.summary?.includes(template.name));
  }
  function recordTimelineItems(record) {
    const fallback = [
      `${record?.createdAt || ''} 创建${recordTypeLabel(record?.recordType)}记录`,
      `${record?.createdAt || ''} 触发方式：${sourceLabel(record?.source)}`,
      record?.status === 'success' || record?.status === 'consumed' ? '结果已成功落库' : `当前状态：${statusLabel(record?.status)}`
    ];
    const lines = Array.isArray(record?.timeline) && record.timeline.length ? record.timeline : fallback;
    return lines.map((line, index) => {
      const text = String(line || '');
      const lower = text.toLowerCase();
      let title = index === lines.length - 1 && record?.status ? statusLabel(record.status) : '状态更新';
      let tone = 'success';
      if (/reserve.*成功|进入占用/.test(lower)) title = '优惠券已占用';
      else if (/consume.*失败|核销失败/.test(lower)) title = '优惠券核销失败';
      else if (/release.*成功|恢复可用/.test(lower)) title = '优惠券已释放';
      else if (/支付成功.*到账|赠券到账|发放成功/.test(text)) title = '优惠券已发放';
      else if (/领取失败|资格不符/.test(text)) title = '优惠券领取失败';
      else if (/领取成功/.test(text)) title = '优惠券领取成功';
      else if (/核销成功|完成核销|已核销/.test(text)) title = '优惠券已核销';
      else if (/充值退款|退款回退/.test(text)) title = '充值退款回退';
      else if (/订单未支付超时|订单关闭/.test(text)) title = '订单已关闭';
      if (/失败|超时/.test(text)) tone = 'warning';
      return { title, text, tone };
    });
  }

  function renderRecordDrawerEnhanced(record) {
    if (!record) return '';
    const activity = getActivity(record.activityId);
    const couponConfig = recordCouponConfig(record);
    const timeline = recordTimelineItems(record);
    const quantity = record.actualCount ?? record.itemCount ?? 1;
    return `<div class="modal-backdrop"><aside class="drawer"><div class="drawer-head"><div><h2>${esc(record.summary || record.id)}</h2><p>${esc(record.id)} · ${esc(recordTypeLabel(record.recordType))}</p></div><button class="close-button" data-action="close-modal">×</button></div><div class="drawer-section"><h3>关联信息</h3><div class="drawer-kv"><div><span>顾客</span><strong>${esc(record.customerId || '-')}</strong></div><div><span>触发方式</span><strong>${esc(sourceLabel(record.source))}</strong></div><div><span>活动</span><strong>${esc(activity?.name || '无关联活动')}</strong></div><div><span>优惠券</span><strong>${esc(couponConfig?.name || recordCouponName(record))}</strong></div><div><span>状态</span><strong>${statusChip(record.status)}</strong></div><div><span>订单</span><strong>${esc(record.orderId || '-')}</strong></div><div><span>券实例</span><strong>${esc(record.couponInstanceId || '-')}</strong></div></div></div><div class="drawer-section"><h3>结果信息</h3><div class="drawer-kv"><div><span>实际优惠</span><strong>${record.discount ? money(record.discount) : '-'}</strong></div><div><span>数量</span><strong>${quantity}</strong></div><div><span>幂等键</span><strong style="font-family:ui-monospace;font-size:10px;word-break:break-all;">${esc(record.idempotencyKey || '-')}</strong></div><div><span>记录时间</span><strong>${esc(record.createdAt)}</strong></div></div><div class="notice" style="margin-top:13px;"><span>i</span><div>${esc(record.message || '暂无补充说明')}</div></div></div><div class="drawer-section"><h3>状态时间线</h3><div class="timeline">${timeline.map(item => `<div class="timeline-item ${item.tone}"><span class="timeline-dot"></span><div class="timeline-copy"><strong>${esc(item.title)}</strong><span>${esc(item.text)}</span></div></div>`).join('')}</div></div></aside></div>`;
  }

  function syncActivityDraftFromForm(form) {
    if (!form) return;
    state.ui.activityDraft = collectActivityDraft(form);
  }
  function collectActivityDraft(form) {
    const fd = new FormData(form);
    const current = clone(state.ui.activityDraft || blankActivityDraft());
    const type = fd.get('type') || current.type;
    const triggerMode = fd.get('triggerMode') || current.triggerMode || (type === 'recharge' ? 'recharge' : 'auto');
    const qualificationLabels = { new_user: '新用户', all: '全部顾客', segment: '指定人群包（待确认）' };
    const tierAmountFields = [...form.querySelectorAll('[name="tierAmounts"]')];
    const tierCouponFields = [...form.querySelectorAll('[name="tierCouponIds"]')];
    const tierQuantityFields = [...form.querySelectorAll('[name="tierCouponQuantities"]')];
    const tierClaimCouponFields = [...form.querySelectorAll('[name="tierClaimCouponIds"]')];
    const tierClaimLimitFields = [...form.querySelectorAll('[name="tierClaimLimits"]')];
    const claimCouponFields = [...form.querySelectorAll('[name="couponClaimIds"]')];
    const claimLimitFields = [...form.querySelectorAll('[name="couponClaimLimits"]')];
    const hasRechargeTiers = tierAmountFields.length > 0;
    const tierAmounts = hasRechargeTiers ? tierAmountFields.map(field => Math.max(0, num(field.value, 0))) : [];
    const rawCouponIds = fd.has('couponIds') ? fd.getAll('couponIds').map(value => String(value || '').trim()) : (current.couponIds || []);
    const couponIds = hasRechargeTiers ? rawCouponIds : rawCouponIds.filter(Boolean);
    const couponQuantities = fd.has('couponQuantities') ? fd.getAll('couponQuantities').map(value => Math.max(0, Math.min(9999, Math.floor(num(value, 100))))) : (current.couponQuantities || []);
    const availableCouponIds = new Set(couponIds.filter(Boolean));
    const claimRows = claimCouponFields.map((field, index) => ({ couponId: String(field.value || '').trim(), limit: Math.max(1, Math.min(9999, Math.floor(num(claimLimitFields[index]?.value, 1)))) }));
    const claimRowsWithinAvailable = claimRows.filter(row => !row.couponId || availableCouponIds.has(row.couponId));
    const couponClaimIds = hasRechargeTiers ? [] : (claimCouponFields.length ? claimRowsWithinAvailable.map(row => row.couponId) : (current.couponClaimIds || []));
    const couponClaimLimits = hasRechargeTiers ? [] : (claimLimitFields.length ? claimRowsWithinAvailable.map(row => row.limit) : (current.couponClaimLimits || []));
    const tierClaimCouponsFor = (tierIndex, upperCoupons, fallbackTier) => { const upperIds = new Set(upperCoupons.map(item => item.couponId).filter(Boolean)); const fields = tierClaimCouponFields.filter(field => Number(field.dataset.tierIndex) === tierIndex); if (!fields.length) return activityTierClaimCoupons(fallbackTier, upperCoupons); const rows = fields.map(field => { const couponIndex = Number(field.dataset.couponIndex) || 0; const limitField = tierClaimLimitFields.find(item => Number(item.dataset.tierIndex) === tierIndex && Number(item.dataset.couponIndex) === couponIndex); return { couponId: String(field.value || '').trim(), limit: Math.max(1, Math.min(9999, Math.floor(num(limitField?.value, 1)))) }; }).filter(item => !item.couponId || upperIds.has(item.couponId)); return rows.length ? rows : [{ couponId: '', limit: 1 }]; };
    const tiers = hasRechargeTiers ? tierAmounts.map((amount, index) => { const currentTier = current.tiers?.[index] || {}; const coupons = couponIds.map((couponId, couponIndex) => ({ couponId, qty: couponQuantities[couponIndex] ?? 0 })); const claimCoupons = tierClaimCouponsFor(index, coupons, currentTier); const firstCoupon = coupons[0] || { couponId: '', qty: 1 }; const coupon = getCouponConfig(firstCoupon.couponId); return { ...currentTier, amount, coupons, claimCoupons, couponId: firstCoupon.couponId, templateId: coupon?.templateId || currentTier.templateId || 'tpl-recharge', qty: firstCoupon.qty }; }) : (current.tiers?.length ? current.tiers : [{ amount: 0, templateId: 'tpl-recharge', qty: 1 }]);
    const cdkBatchIds = fd.has('cdkBatchIds') ? fd.getAll('cdkBatchIds').map(value => String(value || '').trim()).filter(Boolean) : (current.cdkBatchIds || []);
    const limitReceive = fd.get('limitReceive') === 'on';
    const perUserLimit = limitReceive ? Math.max(0, Math.floor(num(fd.get('perUserLimit'), 0))) : 0;
    const qualificationKey = fd.get('qualificationKey') || current.qualificationKey || 'all';
    return { ...current, id: form.dataset.id || current.id || '', name: String(fd.get('name') || '').trim(), type, triggerMode, rechargeMode: fd.get('rechargeMode') || current.rechargeMode || 'regular', sceneCategory: fd.get('sceneCategory') || current.sceneCategory, start: String(fd.get('start') || '').trim(), end: String(fd.get('end') || '').trim(), windowStart: String(fd.get('start') || '').trim(), windowEnd: String(fd.get('end') || '').trim(), qualificationKey, qualification: qualificationLabels[qualificationKey] || current.qualification || '全部顾客', description: fd.get('description') || '', showInRechargeCenter: fd.has('showInRechargeCenter') ? fd.get('showInRechargeCenter') === 'on' : current.showInRechargeCenter === true, rechargePromo: fd.has('rechargePromo') ? String(fd.get('rechargePromo') || '').trim().slice(0, 20) : (current.rechargePromo || ''), limitText: limitReceive ? `每人每活动 ${perUserLimit || 0} 次` : '不限次数', couponIds, couponQuantities, couponClaimIds, couponClaimLimits, cdkBatchIds, limitReceive, perUserLimit, totalLimit: Math.max(0, Math.floor(num(fd.get('totalLimit'), current.totalLimit || 0))), bundle: current.bundle || [], tiers };
  }
  function refreshActivityFormEditor(form) {
    const modal = form?.closest('.activity-create-modal');
    if (!modal) { render(); return; }
    const scratch = document.createElement('div');
    const variant = state.ui.modal?.variant || (state.ui.activityDraft?.type === 'recharge' ? 'stored' : 'other');
    scratch.innerHTML = renderActivityForm(form.dataset.id || '', variant);
    const nextForm = scratch.querySelector('form[data-form="activity"]');
    if (!nextForm) { render(); return; }
    const currentAssociation = form.querySelector('.activity-coupon-field');
    const nextAssociation = nextForm.querySelector('.activity-coupon-field');
    if (currentAssociation && nextAssociation) currentAssociation.replaceWith(nextAssociation);
    const currentClaimLimit = form.querySelector('.activity-single-claim-field');
    const nextClaimLimit = nextForm.querySelector('.activity-single-claim-field');
    if (currentClaimLimit && nextClaimLimit) currentClaimLimit.replaceWith(nextClaimLimit);
    else if (currentClaimLimit && !nextClaimLimit) currentClaimLimit.remove();
    else if (!currentClaimLimit && nextClaimLimit && currentAssociation) currentAssociation.after(nextClaimLimit);
    const currentTierSection = form.querySelector('.activity-tier-section');
    const nextTierSection = nextForm.querySelector('.activity-tier-section');
    if (currentTierSection && nextTierSection) currentTierSection.replaceWith(nextTierSection);
    const currentPreview = modal.querySelector('.preview-card');
    const nextPreview = scratch.querySelector('.preview-card');
    if (currentPreview && nextPreview) currentPreview.replaceWith(nextPreview);
  }
  function updateActivityPreview(form) {
    if (!form) return;
    const draft = collectActivityDraft(form);
    state.ui.activityDraft = draft;
    const preview = form.closest('.split-layout')?.querySelector('.preview-card');
    if (!preview) return;
    const setRow = (label, value) => {
      const row = [...preview.querySelectorAll('.preview-row')].find(item => item.firstElementChild?.textContent === label);
      if (row?.lastElementChild) row.lastElementChild.textContent = value;
    };
    const rechargeTiers = (draft.tiers || []).length ? draft.tiers : [{ amount: 0 }];
    const rechargeTierSummary = rechargeTiers.map(tier => num(tier.amount, 0) ? money(tier.amount) : '未填写').join('、') || '—';
    const activityTimeSummary = draft.start === '长期' && draft.end === '长期' ? '长期' : `${formatDate(draft.start)} 至 ${formatDate(draft.end)}`;
    const qualificationLabels = { new_user: '新用户', all: '全部顾客', segment: '指定人群包（待确认）' };
    const title = preview.querySelector('.preview-title');
    if (title) title.textContent = draft.name || '未命名活动';
    setRow('活动类型', activityTypeLabel(draft));
    setRow('触发方式', ACTIVITY_TRIGGER_MODES[draft.triggerMode] || '充值送券');
    setRow('活动时间', activityTimeSummary);
    setRow('充值梯度', rechargeTierSummary);
    const associationLabel = draft.triggerMode === 'cdk' ? '关联CDK批次' : '关联优惠券与发放总量';
    const associationRow = [...preview.querySelectorAll('.preview-row')].find(item => ['关联优惠券', '关联优惠券与发放总量', '关联CDK批次'].includes(item.firstElementChild?.textContent));
    if (associationRow) { associationRow.firstElementChild.textContent = associationLabel; associationRow.lastElementChild.textContent = `${draft.triggerMode === 'cdk' ? (draft.cdkBatchIds || []).length : (draft.couponIds || []).filter(Boolean).length} 个配置`; }
    setRow('目标资格', qualificationLabels[draft.qualificationKey] || draft.qualification || '全部顾客');
    setRow('限制参加', draft.limitReceive ? `每人 ${Number(draft.perUserLimit) || 0} 次` : '不限次数');
  }
  function validateActivity(draft, options = {}) {
    if (!draft.name.trim()) return '请填写活动名称';
    if (options.requireRecharge && (!draft.tiers?.length || draft.tiers.some(tier => !Number(tier.amount)))) return '请填写每个充值梯度的充值金额';
    if (options.requireRecharge && (!(draft.couponIds || []).length || (draft.couponIds || []).some(couponId => !couponId))) return '请至少选择一种关联优惠券，并填写发放总量';
    if (options.requireRecharge && new Set(draft.couponIds || []).size !== (draft.couponIds || []).length) return '关联优惠券不能重复选择';
    if (options.requireRecharge && draft.tiers.some(tier => !Array.isArray(tier.claimCoupons) || !tier.claimCoupons.length || tier.claimCoupons.some(coupon => !coupon.couponId))) return '请为每个充值梯度选择单次最多领取的优惠券';
    if (options.requireRecharge && draft.tiers.some(tier => { const claimIds = (tier.claimCoupons || []).map(coupon => coupon.couponId).filter(Boolean); return claimIds.some(couponId => !(draft.couponIds || []).includes(couponId)) || new Set(claimIds).size !== claimIds.length; })) return '单次最多领取的优惠券必须来自关联优惠券，且不能重复选择';
    if (!options.requireRecharge && draft.triggerMode !== 'cdk') {
      if (!(draft.couponIds || []).length) return '请至少选择一张关联优惠券，并填写发放总量';
      if (new Set(draft.couponIds || []).size !== (draft.couponIds || []).length) return '关联优惠券不能重复选择';
      if (!(draft.couponClaimIds || []).length) return '请至少选择一张单次最多领取的优惠券';
      const associatedCouponIds = new Set((draft.couponIds || []).filter(Boolean));
      if ((draft.couponClaimIds || []).some(couponId => !associatedCouponIds.has(couponId))) return '单次最多领取的优惠券必须来自关联优惠券';
      if (new Set(draft.couponClaimIds || []).size !== (draft.couponClaimIds || []).length) return '单次最多领取的优惠券不能重复选择';
    }
    if (!draft.start) return '请选择开始时间，或选择“长期”';
    if (!draft.end) return '请选择结束时间，或选择“长期”';
    if ((draft.start === '长期') !== (draft.end === '长期')) return '开始时间和结束时间需同时选择“长期”';
    if (draft.start !== '长期' && draft.end !== '长期' && draft.start > draft.end) return '活动开始时间不能晚于结束时间';
    if (draft.limitReceive && !Number(draft.perUserLimit)) return '请填写限制参加次数';
    if (draft.triggerMode === 'cdk' && !(draft.cdkBatchIds || []).length) return '请选择关联CDK批次';
    return '';
  }
  function saveActivity(draftOverride = null, confirmed = false) {
    const form = document.querySelector('form[data-form="activity"]');
    const draft = draftOverride || (form ? collectActivityDraft(form) : clone(state.ui.activityDraft || blankActivityDraft()));
    if (!draft) return;
    const isRechargeActivity = draft.type === 'recharge';
    const error = validateActivity(draft, { requireRecharge: isRechargeActivity });
    if (error) { showToast(error, 'error'); return; }
    const existing = draft.id ? getActivity(draft.id) : null;
    if (existing && !canEditActivity(existing)) { showToast('已停用或已过期活动不可编辑', 'warning'); return; }
    if (existing && !confirmed) {
      state.ui.activityDraft = clone(draft);
      openConfirm('保存活动配置？', '保存后将影响后续优惠券发放，已经发放的优惠券实例不受影响。', 'save-activity-impact', existing.id);
      return;
    }
    const triggerMap = { auto: 'club_customer_qualified', claim: 'customer_claimed', manual: 'manual_grant', cdk: 'cdk_redeemed', recharge: 'recharge_payment_succeeded' };
    const triggerMode = draft.triggerMode || (draft.type === 'recharge' ? 'recharge' : 'auto');
    const next = { ...(existing || {}), ...draft, triggerMode, clubId: CLUB.id, trigger: triggerMap[triggerMode], triggerText: ACTIVITY_TRIGGER_MODES[triggerMode] || '活动触发', triggerCount: existing?.triggerCount || 0, instanceCount: existing?.instanceCount || 0, redeemedCount: existing?.redeemedCount || 0, usageCount: existing?.usageCount || 0, gmv: existing?.gmv || 0 };
    next.status = next.end && next.end !== '长期' && next.end < DEMO_TODAY ? 'ended' : next.start && next.start !== '长期' && next.start > DEMO_TODAY ? 'scheduled' : 'running';
    if (existing) state.activities = state.activities.map(item => item.id === existing.id ? next : item); else { next.id = uid('act'); state.activities.unshift(next); }
    const selectedCouponIds = new Set((next.couponIds || []).filter(Boolean));
    state.couponConfigs = state.couponConfigs.map(config => {
      const activityIds = (config.activityIds || []).filter(activityId => activityId !== next.id);
      if (selectedCouponIds.has(config.id)) activityIds.push(next.id);
      return { ...config, activityIds };
    });
    state.ui.activityDraft = null;
    clearCurrentRouteModal();
    showToast(existing ? '活动已更新，后续发放将使用新配置，已发布券实例不受影响' : '活动已发布，状态已更新', 'success');
    navigate(isRechargeActivity ? 'activities' : 'activity-other');
  }

  function syncTemplateDraftFromForm(form) {
    if (!form) return;
    state.ui.templateDraft = collectTemplateDraft(form);
  }
  function collectTemplateDraft(form) {
    const fd = new FormData(form);
    const current = clone(state.ui.templateDraft || blankTemplateDraft());
    const draft = { ...current, id: form.dataset.id || current.id || '', name: fd.get('name') || '', description: fd.get('description') || '', calcMethod: fd.get('calcMethod') || current.calcMethod, eligibility: fd.get('eligibility') || current.eligibility, sceneTags: fd.getAll('sceneTags'), scopeGames: fd.getAll('scopeGames'), scopeServices: fd.getAll('scopeServices'), validityMode: fd.get('validityMode') || current.validityMode, usageMode: fd.get('usageMode') || current.usageMode };
    draft.stackable = fd.get('stackable') === 'true';
    if (fd.has('scopeGame') || fd.has('scopeCategory') || fd.has('scopeProduct')) {
      const games = fd.getAll('scopeGame');
      const categories = fd.getAll('scopeCategory');
      const products = fd.getAll('scopeProduct');
      draft.scopeSelections = games.map((game, index) => ({ game: String(game || ''), category: String(categories[index] || ''), product: String(products[index] || '') }));
      draft.scopeGames = [...new Set(draft.scopeSelections.map(item => item.game).filter(Boolean))];
      draft.scopeServices = [...new Set(draft.scopeSelections.map(item => item.category).filter(Boolean))];
    }
    if (fd.has('amount')) draft.amount = num(fd.get('amount'));
    if (fd.has('threshold')) draft.threshold = num(fd.get('threshold'));
    if (fd.has('discountRate')) draft.discountRate = num(fd.get('discountRate'));
    if (fd.has('maxDiscount')) draft.maxDiscount = num(fd.get('maxDiscount'));
    if (fd.has('validDays')) draft.validDays = num(fd.get('validDays'));
    if (fd.has('fixedStart')) draft.fixedStart = fd.get('fixedStart');
    if (fd.has('fixedEnd')) draft.fixedEnd = fd.get('fixedEnd');
    if (fd.has('totalAmount')) draft.totalAmount = num(fd.get('totalAmount'));
    if (fd.has('maxUses')) draft.maxUses = num(fd.get('maxUses'));
    return draft;
  }
  function validateTemplate(draft) {
    if (!draft.name.trim()) return '请填写券模板名称';
    if (draft.calcMethod === 'fixed' && num(draft.amount) <= 0) return '固定减免金额必须大于 0';
    if (draft.calcMethod === 'fixed' && num(draft.threshold) < 0) return '使用门槛不能小于 0';
    if (draft.calcMethod === 'discount' && (num(draft.discountRate) <= 0 || num(draft.discountRate) >= 100)) return '折扣比例需大于 0 且小于 100';
    if (draft.calcMethod === 'discount' && num(draft.maxDiscount) <= 0) return '最高优惠金额必须大于 0';
    if (draft.validityMode === 'relative' && num(draft.validDays) < 1) return '有效天数至少为 1 天';
    if (draft.validityMode === 'fixed' && (!draft.fixedStart || !draft.fixedEnd || draft.fixedStart > draft.fixedEnd)) return '请填写合法的固定日期区间';
    if (draft.usageMode === 'multi' && draft.calcMethod === 'fixed' && (!Number.isInteger(num(draft.maxUses)) || num(draft.maxUses) < 2)) return '最大使用次数必须为大于等于 2 的整数';
    if (draft.usageMode === 'multi' && draft.calcMethod === 'fixed' && !amountCanSplitEvenly(draft.amount, draft.maxUses)) return '优惠金额无法平均分配，请调整优惠金额或使用次数';
    if (draft.usageMode === 'multi' && draft.calcMethod === 'discount' && num(draft.maxUses) < 1) return '最大使用次数至少为 1 次';
    return '';
  }
  function saveTemplate() {
    const form = document.querySelector('form[data-form="template-modal"], form[data-form="template"]');
    if (!form) return;
    const draft = collectTemplateDraft(form);
    const existing = draft.id ? getTemplate(draft.id) : null;
    if (existing?.source === 'default') { showToast('默认模板不可编辑，请通过“由模板新增”创建优惠券', 'warning'); return; }
    const error = validateTemplate(draft);
    if (error) { showToast(error, 'error'); return; }
    if (existing?.locked) { showToast('模板规则已锁定，请通过“由模板新增”创建优惠券', 'warning'); return; }
    const next = { ...(existing || {}), ...draft, clubId: CLUB.id, code: existing?.code || `CPN-${String(idSeed + 1).padStart(4, '0')}`, version: existing?.version || 'v1.0', status: existing?.status || 'active', source: existing?.source || 'custom', issued: existing?.issued || 0, redeemed: existing?.redeemed || 0, locked: existing?.locked || false, createdAt: existing?.createdAt || DEMO_TODAY };
    if (existing) state.templates = state.templates.map(item => item.id === existing.id ? next : item); else { next.id = uid('tpl'); state.templates.unshift(next); }
    state.ui.templateDraft = null;
    clearCurrentRouteModal();
    showToast('券模板已保存', 'success');
    navigate('templates');
  }

  function collectCouponDraft(form) {
    const fd = new FormData(form);
    const current = clone(state.ui.couponDraft || blankCouponDraft());
    const draft = { ...current, id: form.dataset.id || current.id || '', name: String(fd.get('name') || '').trim(), description: fd.get('description') || '', preset: fd.has('preset') ? (fd.get('preset') || '') : current.preset || '', templateId: fd.has('templateId') ? (fd.get('templateId') || '') : current.templateId || '', ruleId: fd.has('ruleId') ? (fd.get('ruleId') || '') : current.ruleId || '', activityIds: fd.has('activityIds') ? fd.getAll('activityIds') : (current.activityIds || []), calcMethod: fd.get('calcMethod') || current.calcMethod, eligibility: fd.get('eligibility') || current.eligibility, sceneTags: fd.getAll('sceneTags'), scopeGames: fd.has('scopeGames') ? fd.getAll('scopeGames') : (current.scopeGames || []), scopeServices: fd.has('scopeServices') ? fd.getAll('scopeServices') : (current.scopeServices || []), validityMode: fd.get('validityMode') || current.validityMode, usageMode: (fd.get('calcMethod') || current.calcMethod) === 'discount' ? 'single' : (fd.get('usageMode') || current.usageMode) };
    if (!fd.has('sceneTags')) draft.sceneTags = current.sceneTags || [];
    draft.stackable = fd.get('stackable') === 'true';
    if (fd.has('orderMin')) draft.orderMin = String(fd.get('orderMin') || '').trim();
    if (fd.has('orderMax')) draft.orderMax = String(fd.get('orderMax') || '').trim();
    if (fd.has('scopeGame') || fd.has('scopeCategory') || fd.has('scopeProduct')) {
      const games = fd.getAll('scopeGame');
      const categories = fd.getAll('scopeCategory');
      const products = fd.getAll('scopeProduct');
      draft.scopeSelections = games.map((game, index) => ({ game: String(game || ''), category: String(categories[index] || ''), product: String(products[index] || '') }));
      draft.scopeGames = [...new Set(draft.scopeSelections.map(item => item.game).filter(Boolean))];
      draft.scopeServices = [...new Set(draft.scopeSelections.map(item => item.category).filter(Boolean))];
    }
    if (fd.has('amount')) draft.amount = num(fd.get('amount'));
    if (fd.has('threshold')) draft.threshold = num(fd.get('threshold'));
    if (fd.has('discountRate')) draft.discountRate = num(fd.get('discountRate'));
    if (fd.has('maxDiscount')) draft.maxDiscount = num(fd.get('maxDiscount'));
    if (fd.has('validDays')) draft.validDays = num(fd.get('validDays'));
    if (fd.has('fixedStart')) draft.fixedStart = fd.get('fixedStart');
    if (fd.has('fixedEnd')) draft.fixedEnd = fd.get('fixedEnd');
    if (fd.has('totalAmount')) draft.totalAmount = num(fd.get('totalAmount'));
    if (fd.has('maxUses')) draft.maxUses = num(fd.get('maxUses'));
    return draft;
  }
  function validateCoupon(draft) {
    if (!draft.name) return '请填写优惠券名称';
    const template = getTemplate(draft.templateId);
    if (draft.templateId && (!template || template.status === 'offline')) return '请选择可用的券模板';
    if (draft.orderMin !== '' && num(draft.orderMin) < 0) return '订单金额下限不能小于 0';
    if (draft.orderMax !== '' && num(draft.orderMax) < 0) return '订单金额上限不能小于 0';
    if (draft.orderMin !== '' && draft.orderMax !== '' && num(draft.orderMin) > num(draft.orderMax)) return '订单金额区间下限不能大于上限';
    if (draft.calcMethod === 'discount' && num(draft.threshold) <= 0) return '折扣券使用门槛必须大于 0';
    return validateTemplate({ ...draft, name: draft.name || template.name });
  }
  function saveCoupon(draftOverride = null) {
    const form = document.querySelector('form[data-form="coupon-config"]');
    if (!form && !draftOverride) return;
    const draft = draftOverride ? clone(draftOverride) : collectCouponDraft(form);
    const error = validateCoupon(draft);
    if (error) { showToast(error, 'error'); return; }
    const existing = draft.id ? getCouponConfig(draft.id) : null;
    const configId = existing?.id || uid('coupon');
    const next = { ...(existing || {}), ...draft, id: configId, code: existing?.code || `CPN-CFG-${String(idSeed).padStart(3, '0')}`, sourceSnapshot: existing?.sourceSnapshot || '', updatedAt: DEMO_TODAY, createdAt: existing?.createdAt || DEMO_TODAY, ruleSnapshot: clone(draft), clubId: CLUB.id };
    if (existing) state.couponConfigs = state.couponConfigs.map(item => item.id === existing.id ? next : item); else state.couponConfigs.unshift(next);
    state.activities.forEach(activity => {
      activity.couponIds = (activity.couponIds || []).filter(item => state.couponConfigs.some(config => config.id === item && (config.activityIds || []).includes(activity.id)));
    });
    (next.activityIds || []).forEach(activityId => { const activity = getActivity(activityId); if (activity) activity.couponIds = [...new Set([...(activity.couponIds || []), configId])]; });
    state.ui.couponDraft = null;
    clearCurrentRouteModal();
    showToast(existing ? '优惠券配置已更新' : '优惠券配置已新增', 'success');
    navigate('coupon-form');
  }

  function deleteCouponConfig(id) {
    const config = getCouponConfig(id);
    if (!config) { showToast('优惠券配置不存在或已删除', 'warning'); return; }
    state.couponConfigs = state.couponConfigs.filter(item => item.id !== id);
    state.activities.forEach(activity => { activity.couponIds = (activity.couponIds || []).filter(couponId => couponId !== id); });
    state.cdkBatches.forEach(batch => { batch.couponIds = (batch.couponIds || []).filter(couponId => couponId !== id); });
    if (state.ui.couponDraft?.id === id) state.ui.couponDraft = null;
    showToast('优惠券配置已删除', 'success');
  }

  function saveCouponAsTemplate(options = {}) {
    const form = document.querySelector('form[data-form="coupon-config"]');
    if (!form && !options.draft) return false;
    const draft = options.draft ? clone(options.draft) : collectCouponDraft(form);
    if (!draft.name) { showToast('请填写优惠券名称', 'error'); return false; }
    if (draft.calcMethod === 'discount' && num(draft.threshold) <= 0) { showToast('折扣券使用门槛必须大于 0', 'error'); return false; }
    const templateDraft = {
      id: '',
      name: draft.name,
      description: draft.description,
      preset: '',
      calcMethod: draft.calcMethod,
      amount: draft.amount,
      threshold: draft.threshold,
      discountRate: draft.discountRate,
      maxDiscount: draft.maxDiscount,
      eligibility: draft.eligibility,
      sceneTags: clone(draft.sceneTags || []),
      scopeGames: clone(draft.scopeGames || []),
      scopeServices: clone(draft.scopeServices || []),
      scopeSelections: clone(draft.scopeSelections || [{ game: '', category: '', product: '' }]),
      stackable: Boolean(draft.stackable),
      validityMode: draft.validityMode,
      validDays: draft.validDays,
      fixedStart: draft.fixedStart,
      fixedEnd: draft.fixedEnd,
      usageMode: draft.usageMode,
      totalAmount: draft.totalAmount,
      maxUses: draft.maxUses
    };
    const error = validateTemplate(templateDraft);
    if (error) { showToast(error, 'error'); return false; }
    const next = { ...templateDraft, id: uid('tpl'), code: `CPN-${String(idSeed).padStart(4, '0')}`, version: 'v1.0', status: 'active', source: 'custom', issued: 0, redeemed: 0, locked: false, createdAt: DEMO_TODAY, clubId: CLUB.id };
    state.templates.unshift(next);
    state.ui.couponDraft = clone(draft);
    if (!options.silent) showToast('已另存为自定义券模板', 'success');
    if (options.navigate !== false) navigate('templates');
    return true;
  }

  function syncCouponDraftFromForm(form) {
    if (!form) return;
    state.ui.couponDraft = collectCouponDraft(form);
  }
  function isTemplateEditorForm(form) { return form?.dataset.form === 'template-modal'; }
  function syncCouponEditorDraftFromForm(form) {
    if (!form) return;
    if (isTemplateEditorForm(form)) syncTemplateDraftFromForm(form); else syncCouponDraftFromForm(form);
  }
  function couponEditorDraftForForm(form) {
    return isTemplateEditorForm(form) ? (state.ui.templateDraft || blankTemplateDraft()) : (state.ui.couponDraft || blankCouponDraft());
  }
  function saveCouponEditorDraft(form, draft) {
    if (isTemplateEditorForm(form)) state.ui.templateDraft = draft; else state.ui.couponDraft = draft;
  }
  function renderCouponEditorSurface(form) {
    if (isTemplateEditorForm(form)) renderTemplateModalOnly(); else renderCouponSurface();
  }
  function saveManualGrant() {
    const form = document.querySelector('form[data-form="manual-grant"], form[data-form="manual-grant-page"]');
    const modal = state.ui.modal;
    const fd = form ? new FormData(form) : null;
    if (!form) return;
    const isPageForm = form.dataset.form === 'manual-grant-page';
    const requestedCouponIds = isPageForm ? fd.getAll('couponConfigIds').map(value => String(value || '').trim()).filter(Boolean) : [modal?.id || fd?.get('couponConfigId') || state.ui.manualGrantDraft?.couponConfigId].filter(Boolean);
    const configs = [...new Set(requestedCouponIds)].map(configId => getCouponConfig(configId)).filter(Boolean);
    const pageQuantityFields = isPageForm ? [...form.querySelectorAll('input[name="couponQuantities"]')] : [];
    const pageQuantities = Object.fromEntries(pageQuantityFields.map(input => [input.dataset.couponId, Math.floor(num(input.value, 1))]));
    if (!form || !configs.length) { showToast('请选择至少一种优惠券配置', 'error'); return; }
    const requestedActivityId = String(fd.get('activityId') || '').trim();
    const linkedManualActivityId = (configs[0].activityIds || []).find(activityId => activityTriggerMode(getActivity(activityId)) === 'manual') || '';
    const activityId = requestedActivityId || linkedManualActivityId;
    const activity = getActivity(activityId);
    const customerId = String(fd.get('customerId') || '').trim();
    const quantity = Math.floor(num(fd.get('quantity'), 1));
    if (!customerId) { showToast('请填写用户 UID', 'error'); return; }
    if (isPageForm && (!activity || activityTriggerMode(activity) !== 'manual' || activity.status !== 'running')) { showToast('请选择进行中的手动发放活动', 'error'); return; }
    if (isPageForm && configs.some(config => !(config.activityIds || []).includes(activityId))) { showToast('只能选择当前活动已关联的优惠券配置', 'error'); return; }
    const grantItems = configs.map(config => ({ config, quantity: isPageForm ? pageQuantities[config.id] : quantity }));
    const invalidItem = grantItems.find(item => !Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 99);
    if (invalidItem) { showToast('每种优惠券的发放数量需为 1～99 张', 'error'); return; }
    const insufficientItem = grantItems.find(item => item.quantity > Math.max(0, num(item.config.availableCount)));
    if (insufficientItem) { showToast(`${insufficientItem.config.name}可用库存不足，当前最多可发 ${Math.max(0, num(insufficientItem.config.availableCount))} 张`, 'error'); return; }
    const createdAt = `${DEMO_TODAY} 11:30`;
    let totalQuantity = 0;
    grantItems.forEach(({ config, quantity }) => {
      const template = couponConfigTemplate(config);
      const instanceIds = [];
      for (let index = 0; index < quantity; index += 1) {
        const instanceId = uid('CPN-I');
        instanceIds.push(instanceId);
        state.coupons.unshift({ id: instanceId, couponNo: instanceId, templateId: config.templateId, customerId, source: 'manual', status: 'available', usageCount: 0, createdAt, ruleSnapshot: template ? clone(template) : {}, couponConfigId: config.id, activityId, clubId: CLUB.id });
      }
      config.issuedCount = num(config.issuedCount) + quantity;
      config.availableCount = Math.max(0, num(config.availableCount) - quantity);
      totalQuantity += quantity;
      state.records.unshift({ id: uid('GR'), recordType: 'grant', source: 'manual', status: 'success', activityId, couponConfigId: config.id, couponInstanceId: instanceIds[0], couponInstanceIds: instanceIds, customerId, itemCount: quantity, actualCount: quantity, idempotencyKey: `manual_grant:${activityId || 'unassigned'}:${config.id}:${customerId}:${createdAt}`, createdAt, summary: `${config.name} × ${quantity}`, message: `人工发券成功，生成 ${quantity} 张顾客券实例。${activity ? `活动：${activity.name}。` : ''}${fd.get('note') ? `备注：${fd.get('note')}` : ''}` });
    });
    state.metrics.instances = num(state.metrics.instances) + totalQuantity;
    if (isPageForm) state.ui.manualGrantDraft = { activityId: '', couponConfigIds: [], couponConfigId: '', couponQuantities: {}, customerId: '', quantity: 1, note: '' };
    clearCurrentRouteModal();
    showToast(`已按各券数量成功发放，共生成 ${totalQuantity} 张顾客券实例`, 'success');
    render();
  }

  function openConfirm(title, description, action, id, danger = false) { state.ui.modal = { type: 'confirm', title, description, action, id, danger }; render(); }
  function deleteActivity(id) {
    const activity = getActivity(id);
    if (!activity || !['ended', 'offline'].includes(activity.status)) { showToast('只有已结束或已停用的活动可以删除', 'warning'); return; }
    state.activities = state.activities.filter(item => item.id !== id);
    state.couponConfigs.forEach(config => { config.activityIds = (config.activityIds || []).filter(activityId => activityId !== id); });
    if (state.ui.activityDraft?.id === id) state.ui.activityDraft = null;
    showToast(activity.status === 'ended' ? '已结束活动已删除' : '已停用活动已删除', 'success');
  }
  function confirmModal() {
    const modal = state.ui.modal;
    if (!modal) return;
    if (modal.action === 'save-activity-impact') {
      const draft = clone(state.ui.activityDraft || blankActivityDraft());
      state.ui.modal = null;
      saveActivity(draft, true);
      return;
    }
    if (modal.action === 'stop-activity') {
      const activity = getActivity(modal.id);
      if (activity) activity.status = 'offline';
      showToast('活动已停用，历史记录仍可查询', 'success');
    } else if (modal.action === 'delete-activity') {
      deleteActivity(modal.id);
    } else if (modal.action === 'delete-coupon-config') {
      deleteCouponConfig(modal.id);
    } else if (modal.action === 'delete-template') {
      const template = getTemplate(modal.id);
      if (!template || template.source === 'default') {
        showToast('默认模板不支持删除', 'warning');
      } else {
        state.templates = state.templates.filter(item => item.id !== modal.id);
        showToast('模板已删除', 'success');
      }
    } else if (modal.action === 'pause-cdk-batch') {
      const batch = state.cdkBatches.find(item => item.id === modal.id);
      if (batch && batch.status === 'running') batch.status = 'paused';
      showToast('CDK批次已暂停发放', 'success');
    } else if (modal.action === 'terminate-cdk-batch') {
      const batch = state.cdkBatches.find(item => item.id === modal.id);
      if (batch && !['ended', 'terminated', 'expired'].includes(batch.status)) batch.status = 'terminated';
      showToast('CDK批次已终止', 'success');
    }
    clearCurrentRouteModal();
    render();
  }

  function openDashboardRecords({ recordType = 'grant', status = 'all', sourceOverride = null, activityOverride = null, period = null } = {}) {
    const dashboardFilter = state.ui.dashboardFilter;
    navigate('records', { tab: recordType }, () => {
      state.ui.recordFilter = {
        ...state.ui.recordFilter,
        q: '',
        customer: '',
        status,
        source: sourceOverride || dashboardFilter.source,
        activityId: activityOverride || (dashboardFilter.activity === 'all' ? '' : dashboardFilter.activity),
        couponConfigId: dashboardFilter.coupon === 'all' ? '' : dashboardFilter.coupon,
        range: dashboardFilter.range,
        dateStart: period?.start || '',
        dateEnd: period?.end || '',
        fromDashboard: true
      };
      state.ui.recordTab = recordType;
    });
  }
  function dashboardRefreshTimestamp() {
    return new Date().toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-');
  }

  function copyActivity(id) {
    const activity = getActivity(id);
    if (!activity) return;
    const linkedCoupons = activityCouponConfigs({ id });
    const copy = clone(activity);
    copy.id = '';
    copy.name = `${copy.name}（副本）`;
    copy.status = copy.end && copy.end !== '长期' && copy.end < DEMO_TODAY ? 'ended' : copy.start && copy.start !== '长期' && copy.start > DEMO_TODAY ? 'scheduled' : 'running';
    copy.couponIds = linkedCoupons.map(config => config.id);
    copy.couponQuantities = linkedCoupons.map(() => 100);
    copy.couponClaimIds = linkedCoupons.map(config => config.id);
    copy.couponClaimLimits = linkedCoupons.map(() => 1);
    copy.triggerCount = 0; copy.instanceCount = 0; copy.redeemedCount = 0; copy.usageCount = 0; copy.gmv = 0;
    state.ui.activityDraft = copy;
    state.ui.modal = { type: 'activity-form', id: '', variant: copy.type === 'recharge' ? 'stored' : 'other' };
    render();
  }
  function createCouponFromTemplate(id) {
    const template = getTemplate(id);
    if (!template) return;
    const copy = clone(template);
    state.ui.couponDraft = {
      ...blankCouponDraft(),
      id: '', name: copy.name || '', description: copy.description || '', preset: copy.source === 'custom' ? 'custom' : (copy.preset || ''), templateId: template.id,
      ruleId: '', activityIds: [], calcMethod: copy.calcMethod, amount: copy.amount, threshold: copy.threshold, discountRate: copy.discountRate, maxDiscount: copy.maxDiscount,
      eligibility: copy.eligibility, sceneTags: clone(copy.sceneTags || []), scopeGames: clone(copy.scopeGames || []), scopeServices: clone(copy.scopeServices || []), scopeSelections: clone(normalizeCouponScopeSelections(copy)),
      validityMode: copy.validityMode, validDays: copy.validDays, fixedStart: copy.fixedStart || '', fixedEnd: copy.fixedEnd || '', usageMode: copy.usageMode, totalAmount: copy.totalAmount, maxUses: copy.maxUses, stackable: Boolean(copy.stackable)
    };
    state.ui.templateDraft = null;
    state.ui.couponReadonly = false;
    state.ui.couponReturnToDetail = false;
    state.ui.couponAdvancedExpanded = true;
    state.ui.modal = { type: 'coupon-form', id: '' };
    showToast('已带入模板配置，请继续完善优惠券信息', 'success');
    if (window.location.hash === '#coupon-form') render(); else window.location.hash = '#coupon-form';
  }

  function handleAction(node) {
    const action = node.dataset.action;
    const id = node.dataset.id;
    const openNewActivityModal = (variant = 'stored') => {
      const isOtherCreate = variant === 'other';
      state.ui.activityDraft = { ...blankActivityDraft(), type: isOtherCreate ? 'new_customer' : 'recharge', triggerMode: isOtherCreate ? 'auto' : 'recharge', rechargeMode: 'regular', sceneCategory: isOtherCreate ? 'customer_identity' : 'customer_behavior', qualificationKey: isOtherCreate ? 'new_user' : 'all', qualification: isOtherCreate ? '新用户' : '全部顾客', couponIds: isOtherCreate ? [''] : ['coupon-002'], couponQuantities: [100], couponClaimIds: isOtherCreate ? [''] : ['coupon-002'], couponClaimLimits: [1], bundle: [], tiers: [{ amount: 0, templateId: 'tpl-recharge', qty: 1, coupons: [{ couponId: isOtherCreate ? '' : 'coupon-002', qty: 1 }], claimCoupons: [{ couponId: isOtherCreate ? '' : 'coupon-002', limit: 1 }] }] };
      state.ui.modal = { type: 'activity-form', id: '', variant };
      render();
    };
    if (action === 'customer-miniapp-tab') { state.ui.customerMiniTab = node.dataset.tab || 'claim'; render(); return; }
    if (action === 'customer-recharge-activity-center') { state.ui.customerRechargeSubPage = 'activities'; if (id) state.ui.customerRechargeActivityId = id; render(); return; }
    if (action === 'customer-recharge-activity-back') { state.ui.customerRechargeSubPage = ''; render(); return; }
    if (action === 'customer-recharge-activity-detail') { state.ui.customerRechargeActivityId = id; if (node.dataset.index !== undefined) state.ui.customerRechargeCarouselIndex = Number(node.dataset.index) || 0; render(); return; }
    if (action === 'customer-recharge-carousel-step') { const localDate = new Date(); const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`; const activities = state.activities.filter(activity => activity.type === 'recharge' && activity.start !== '长期' && activity.end !== '长期' && activity.start && activity.end && ['running', 'scheduled'].includes(activity.status) && activity.end >= today); const count = activities.length; if (count > 1) { state.ui.customerRechargeCarouselIndex = (Number(state.ui.customerRechargeCarouselIndex || 0) + Number(node.dataset.step || 1) + count) % count; state.ui.customerRechargeActivityId = activities[state.ui.customerRechargeCarouselIndex]?.id || ''; } render(); return; }
    if (action === 'customer-account-tier-select') { node.closest('.customer-account-tier-section')?.querySelectorAll('.customer-account-tier-option').forEach(option => option.classList.toggle('selected', option === node)); return; }
    if (action === 'customer-claim') { node.classList.add('got'); node.disabled = true; node.textContent = '已领'; showToast('已领取，去“我的优惠券”查看', 'success'); return; }
    if (action === 'customer-payment-select') {
      node.closest('.customer-payment-methods')?.querySelectorAll('.customer-payment-method').forEach(method => {
        const isSelected = method === node;
        method.classList.toggle('selected', isSelected);
        method.setAttribute('aria-pressed', String(isSelected));
      });
      return;
    }
    if (action === 'customer-recharge-select') {
      const phone = node.closest('.customer-miniapp-phone');
      phone?.querySelectorAll('.customer-recharge-row').forEach(item => item.classList.toggle('selected', item === node));
      const button = phone?.querySelector('[data-action="customer-recharge-confirm"]');
      if (button) button.textContent = `确认充值 ¥${Number(node.dataset.value || 0).toLocaleString('zh-CN')}`;
      return;
    }
    if (action === 'customer-recharge-confirm') { showToast('充值成功！赠券已自动到账', 'success'); return; }
    if (action === 'customer-checkout-select') {
      const phone = node.closest('.customer-miniapp-phone');
      phone?.querySelectorAll('.customer-checkout-option').forEach(item => item.classList.toggle('selected', item === node));
      const cut = Number(node.dataset.cut || 0);
      const line = phone?.querySelector('[data-customer-coupon-line]');
      const total = phone?.querySelector('[data-customer-total]');
      if (line) line.textContent = `${node.dataset.label || '不使用优惠券'} ›`;
      if (total) total.textContent = `¥${(150 - cut).toFixed(2)}`;
      return;
    }
    if (action === 'reset') { state = createState(); navigate('activities'); showToast('演示数据已重置'); return; }
    if (action === 'cdk-management') { navigate('distribution-management', { tab: 'cdk' }); return; }
    if (action === 'cdk-batch-create') { state.ui.cdkBatchDraft = blankCdkBatchDraft(); state.ui.modal = { type: 'cdk-batch-form' }; render(); return; }
    if (action === 'cdk-detail') { state.ui.modal = { type: 'cdk-detail', id }; render(); return; }
    if (action === 'cdk-adjust-number') {
      const form = node.closest('form[data-form="cdk-batch"]');
      const draft = collectCdkBatchDraft(form);
      draft.totalRedeem = Math.max(1, draft.totalRedeem + (Number(node.dataset.step) || 0));
      state.ui.cdkBatchDraft = draft;
      render();
      return;
    }
    if (action === 'cdk-add-coupon' || action === 'cdk-remove-coupon') {
      const form = node.closest('form[data-form="cdk-batch"]');
      const draft = collectCdkBatchDraft(form);
      const couponIds = [...(draft.couponIds || [])];
      if (action === 'cdk-add-coupon') couponIds.push('');
      else couponIds.splice(Number(node.dataset.index), 1);
      draft.couponIds = couponIds.length ? couponIds : [''];
      state.ui.cdkBatchDraft = draft;
      render();
      return;
    }
    if (action === 'cdk-export') {
      const batch = state.cdkBatches.find(item => item.id === id);
      if (batch) showToast(`已生成“${batch.name}”的码列表导出任务`, 'success');
      return;
    }
    if (action === 'cdk-pause') {
      const batch = state.cdkBatches.find(item => item.id === id);
      if (batch && batch.status === 'running') openConfirm('暂停发放', `暂停后将不再发放“${batch.name}”中的新兑换码，已兑换码不受影响。`, 'pause-cdk-batch', id);
      return;
    }
    if (action === 'cdk-resume') {
      const batch = state.cdkBatches.find(item => item.id === id);
      if (batch && batch.status === 'paused') { batch.status = 'running'; showToast('CDK批次已恢复发放', 'success'); render(); }
      return;
    }
    if (action === 'cdk-terminate') {
      const batch = state.cdkBatches.find(item => item.id === id);
      if (batch && !['ended', 'terminated', 'expired'].includes(batch.status)) openConfirm('终止批次', '终止后将停止该批次的兑换，已兑换记录仍可查询。', 'terminate-cdk-batch', id, true);
      return;
    }
    if (action === 'cdk-page-number' || action === 'cdk-page-prev' || action === 'cdk-page-next') { switchViewUnit(() => { state.ui.cdkPage = Math.max(1, Number(node.dataset.page) || 1); }); return; }
    if (action === 'show-rules') { state.ui.modal = { type: 'rules' }; render(); return; }
    if (action === 'coupon-publish-dismiss') { state.ui.couponReadonly = false; state.ui.couponReturnToDetail = false; state.ui.modal = { type: 'coupon-form', id: state.ui.couponDraft?.id || '' }; render(); return; }
    if (action === 'close-modal') { clearCurrentRouteModal(); render(); return; }
    if (action === 'coupon-stackable' && isTemplateEditorForm(node.closest('form'))) { const form = node.closest('form'); syncCouponEditorDraftFromForm(form); const draft = couponEditorDraftForForm(form); draft.stackable = node.dataset.value === 'true'; saveCouponEditorDraft(form, draft); renderCouponEditorSurface(form); return; }
    if (action === 'coupon-stackable') { const form = node.closest('form[data-form="coupon-config"]'); if (form) syncCouponDraftFromForm(form); const draft = state.ui.couponDraft || blankCouponDraft(); draft.stackable = node.dataset.value === 'true'; state.ui.couponDraft = draft; renderCouponSurface(); return; }
    if (action === 'confirm-modal') { confirmModal(); return; }
    if (action === 'open-template-form') { state.ui.templateDraft = blankTemplateDraft(); state.ui.templateAdvancedExpanded = null; state.ui.modal = { type: 'template-form', id: '' }; render(); return; }
    if (action === 'open-coupon-create') { state.ui.couponDraft = null; state.ui.couponReadonly = false; state.ui.couponReturnToDetail = false; state.ui.couponAdvancedExpanded = null; state.ui.modal = { type: 'coupon-form', id: '' }; render(); return; }
    if (action === 'activity-create') { openNewActivityModal('stored'); return; }
    if (action === 'other-activity-create') { openNewActivityModal('other'); return; }
    if (action === 'activity-trigger') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const nextTriggerMode = node.dataset.value || 'auto';
      if (nextTriggerMode === 'cdk') { draft.couponIds = []; draft.couponQuantities = []; draft.couponClaimIds = []; draft.couponClaimLimits = []; draft.couponClaimCustomized = false; }
      if (nextTriggerMode !== 'cdk') draft.cdkBatchIds = [];
      draft.triggerMode = nextTriggerMode;
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'activity-add-coupon') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      draft.couponIds = [...(draft.couponIds || []), ''];
      draft.couponQuantities = [...(draft.couponQuantities || []), 100];
      if (draft.type === 'recharge' || draft.triggerMode === 'recharge') {
        const upperCoupons = (draft.couponIds || []).map((couponId, index) => ({ couponId, qty: draft.couponQuantities?.[index] ?? 100 }));
        draft.tiers = (draft.tiers || []).map(tier => { const claimCoupons = activityTierClaimCoupons(tier, upperCoupons); if (!claimCoupons.some(item => !item.couponId)) claimCoupons.push({ couponId: '', limit: 1 }); return { ...tier, coupons: upperCoupons, claimCoupons }; });
      } else {
        draft.couponClaimIds = [...(draft.couponClaimIds || []), ''];
        draft.couponClaimLimits = [...(draft.couponClaimLimits || []), 1];
      }
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'activity-add-claim-coupon') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const associatedCouponIds = (draft.couponIds || []).filter(Boolean);
      const selectedClaimIds = (draft.couponClaimIds || []).filter(Boolean);
      if (!associatedCouponIds.length || associatedCouponIds.every(couponId => selectedClaimIds.includes(couponId))) return;
      draft.couponClaimCustomized = true;
      draft.couponClaimIds = [...(draft.couponClaimIds || []), ''];
      draft.couponClaimLimits = [...(draft.couponClaimLimits || []), 1];
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'activity-remove-claim-coupon') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const index = Number(node.dataset.index);
      draft.couponClaimCustomized = true;
      draft.couponClaimIds = (draft.couponClaimIds || []).filter((_, itemIndex) => itemIndex !== index);
      draft.couponClaimLimits = (draft.couponClaimLimits || []).filter((_, itemIndex) => itemIndex !== index);
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'activity-remove-coupon') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const index = Number(node.dataset.index);
      draft.couponIds = (draft.couponIds || []).filter((_, itemIndex) => itemIndex !== index);
      draft.couponQuantities = (draft.couponQuantities || []).filter((_, itemIndex) => itemIndex !== index);
      const availableCouponIds = new Set(draft.couponIds.filter(Boolean));
      if (draft.type === 'recharge' || draft.triggerMode === 'recharge') {
        draft.tiers = (draft.tiers || []).map(tier => { const claimCoupons = activityTierClaimCoupons(tier).filter(item => !item.couponId || availableCouponIds.has(item.couponId)); if (!claimCoupons.length) claimCoupons.push({ couponId: '', limit: 1 }); return { ...tier, coupons: (draft.couponIds || []).map((couponId, couponIndex) => ({ couponId, qty: draft.couponQuantities?.[couponIndex] ?? 100 })), claimCoupons }; });
      } else {
        draft.couponClaimIds = (draft.couponClaimIds || []).filter(couponId => availableCouponIds.has(couponId));
      }
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'activity-add-tier') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      draft.tiers = [...(draft.tiers || []), { amount: '', couponId: '', templateId: 'tpl-recharge', qty: 1, coupons: [{ couponId: '', qty: 1 }], claimCoupons: [{ couponId: '', limit: 1 }] }];
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'activity-remove-tier') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const index = Number(node.dataset.index);
      draft.tiers = (draft.tiers || []).filter((_, itemIndex) => itemIndex !== index);
      if (!draft.tiers.length) draft.tiers = [{ amount: '', couponId: '', templateId: 'tpl-recharge', qty: 1, coupons: [{ couponId: '', qty: 1 }], claimCoupons: [{ couponId: '', limit: 1 }] }];
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'activity-add-tier-coupon') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const tierIndex = Math.max(0, Number(node.dataset.tierIndex) || 0);
      const tier = draft.tiers?.[tierIndex];
      if (!tier) return;
      const upperCoupons = [...activityTierCoupons(tier), { couponId: '', qty: 1 }];
      tier.coupons = upperCoupons;
      tier.claimCoupons = [...activityTierClaimCoupons(tier, upperCoupons), { couponId: '', limit: 1 }];
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'activity-remove-tier-coupon') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const tierIndex = Math.max(0, Number(node.dataset.tierIndex) || 0);
      const couponIndex = Math.max(1, Number(node.dataset.couponIndex) || 1);
      const tier = draft.tiers?.[tierIndex];
      if (!tier) return;
      tier.coupons = activityTierCoupons(tier).filter((_, itemIndex) => itemIndex !== couponIndex);
      if (!tier.coupons.length) tier.coupons = [{ couponId: '', qty: 1 }];
      const upperIds = new Set(tier.coupons.map(item => item.couponId).filter(Boolean));
      tier.claimCoupons = activityTierClaimCoupons(tier).filter(item => !item.couponId || upperIds.has(item.couponId));
      if (!tier.claimCoupons.length) tier.claimCoupons = [{ couponId: '', limit: 1 }];
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'activity-add-tier-claim-coupon') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const tierIndex = Math.max(0, Number(node.dataset.tierIndex) || 0);
      const tier = draft.tiers?.[tierIndex];
      if (!tier) return;
      const upperCoupons = activityTierCoupons(tier);
      const claimCoupons = activityTierClaimCoupons(tier, upperCoupons);
      const selectedIds = new Set(claimCoupons.map(item => item.couponId).filter(Boolean));
      const nextCouponId = upperCoupons.find(item => item.couponId && !selectedIds.has(item.couponId))?.couponId || '';
      const blankIndex = claimCoupons.findIndex(item => !item.couponId);
      if (nextCouponId) {
        if (blankIndex >= 0) claimCoupons[blankIndex] = { couponId: nextCouponId, limit: 1 };
        else claimCoupons.push({ couponId: nextCouponId, limit: 1 });
      }
      tier.claimCoupons = claimCoupons;
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'activity-remove-tier-claim-coupon') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const tierIndex = Math.max(0, Number(node.dataset.tierIndex) || 0);
      const couponIndex = Math.max(0, Number(node.dataset.couponIndex) || 0);
      const tier = draft.tiers?.[tierIndex];
      if (!tier) return;
      tier.claimCoupons = activityTierClaimCoupons(tier).filter((_, itemIndex) => itemIndex !== couponIndex);
      if (!tier.claimCoupons.length) tier.claimCoupons = [{ couponId: '', limit: 1 }];
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'activity-set-long-term') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const field = node.dataset.field === 'end' ? 'end' : 'start';
      draft[field] = draft[field] === '长期' ? '' : '长期';
      draft[field === 'start' ? 'windowStart' : 'windowEnd'] = '长期';
      state.ui.activityDraft = draft;
      render();
      return;
    }
    if (action === 'activity-adjust-number') {
      const form = node.closest('form[data-form="activity"]');
      syncActivityDraftFromForm(form);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const field = node.dataset.field || 'tierAmount';
      const step = Number(node.dataset.step) || 0;
      if (field === 'perUserLimit') {
        draft.limitReceive = true;
        draft.perUserLimit = Math.max(1, Math.floor(num(draft.perUserLimit, 0) + step));
      } else if (field === 'couponQuantity') {
        const index = Math.max(0, Number(node.dataset.index) || 0);
        draft.couponQuantities = [...(draft.couponQuantities || [])];
        draft.couponQuantities[index] = Math.max(0, Math.min(9999, Math.floor(num(draft.couponQuantities[index], 100) + step)));
      } else if (field === 'couponClaimLimit') {
        const index = Math.max(0, Number(node.dataset.index) || 0);
        draft.couponClaimLimits = [...(draft.couponClaimLimits || [])];
        draft.couponClaimLimits[index] = Math.max(1, Math.min(9999, Math.floor(num(draft.couponClaimLimits[index], 1) + step)));
      } else if (field === 'tierClaimLimit') {
        const tierIndex = Math.max(0, Number(node.dataset.tierIndex) || 0);
        const couponIndex = Math.max(0, Number(node.dataset.couponIndex) || 0);
        const tier = draft.tiers?.[tierIndex];
        if (!tier) return;
        const claimCoupons = activityTierClaimCoupons(tier);
        claimCoupons[couponIndex] = { ...(claimCoupons[couponIndex] || { couponId: '', limit: 1 }), limit: Math.max(1, Math.min(9999, Math.floor(num(claimCoupons[couponIndex]?.limit, 1) + step))) };
        tier.claimCoupons = claimCoupons;
      } else if (field === 'tierCouponQuantity') {
        const tierIndex = Math.max(0, Number(node.dataset.tierIndex) || 0);
        const couponIndex = Math.max(0, Number(node.dataset.couponIndex) || 0);
        const tier = draft.tiers?.[tierIndex];
        if (!tier) return;
        const coupons = activityTierCoupons(tier);
        coupons[couponIndex] = { ...(coupons[couponIndex] || { couponId: '', qty: 1 }), qty: Math.max(0, Math.min(9999, Math.floor(num(coupons[couponIndex]?.qty, 100) + step))) };
        tier.coupons = coupons;
      } else {
        const index = Math.max(0, Number(node.dataset.index) || 0);
        const amount = Math.max(0.01, Math.round((num(draft.tiers?.[index]?.amount, 0) + step) * 100) / 100);
        draft.tiers = draft.tiers?.length ? draft.tiers.map((tier, tierIndex) => tierIndex === index ? { ...tier, amount } : tier) : [{ amount, templateId: 'tpl-recharge', qty: 1 }];
      }
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(form);
      return;
    }
    if (action === 'coupon-preset' && couponTypePresetKey(state.ui.couponDraft || blankCouponDraft()) === node.dataset.preset) { const draft = state.ui.couponDraft || blankCouponDraft(); state.ui.couponDraft = { ...draft, preset: '', templateId: '' }; state.ui.couponAdvancedExpanded = false; renderCouponSurface(); return; }
    if (action === 'activity-page-number' || action === 'activity-page-prev' || action === 'activity-page-next') { switchViewUnit(() => { state.ui.activityPage = Math.max(1, Number(node.dataset.page) || 1); }); return; }
    if (action === 'coupon-page-number' || action === 'coupon-page-prev' || action === 'coupon-page-next') { switchViewUnit(() => { state.ui.couponPage = Math.max(1, Number(node.dataset.page) || 1); }); return; }
    if (action === 'template-page-number' || action === 'template-page-prev' || action === 'template-page-next') { switchViewUnit(() => { state.ui.templatePage = Math.max(1, Number(node.dataset.page) || 1); }); return; }
    if (action === 'coupon-detail') { openCouponModal(id, true); return; }
    if (action === 'coupon-edit') { openCouponModal(id, false); return; }
    if (action === 'coupon-enter-edit') { state.ui.couponReadonly = false; state.ui.couponReturnToDetail = true; state.ui.modal = { type: 'coupon-form', id: id || state.ui.couponDraft?.id || '' }; renderCouponSurface(); return; }
    if (action === 'coupon-cancel-edit') { openCouponModal(id || state.ui.couponDraft?.id || '', true); return; }
    if (action === 'coupon-records') { navigate('records', { tab: node.dataset.tab || 'grant' }, () => { state.ui.recordFilter.couponConfigId = id || ''; state.ui.recordFilter.activityId = ''; }); return; }
    if (action === 'coupon-config-delete') { const config = getCouponConfig(id); if (!config) { showToast('优惠券配置不存在或已删除', 'warning'); return; } openConfirm(`删除优惠券配置“${config.name}”？`, '删除后将解除关联活动和 CDK 批次；历史发放与核销记录保留。此操作不可撤销。', 'delete-coupon-config', id, true); return; }
    if (action === 'coupon-execute-manual') { const config = getCouponConfig(id); if (!config) { showToast('优惠券配置不存在或已删除', 'warning'); return; } state.ui.modal = { type: 'manual-grant', id }; render(); return; }
    if (action === 'manual-grant-add-coupon' || action === 'manual-grant-remove-coupon') {
      const form = node.closest('form[data-form="manual-grant-page"]');
      if (!form) return;
      const current = state.ui.manualGrantDraft || { activityId: '', couponConfigIds: [], couponConfigId: '', couponQuantities: {}, customerId: '', quantity: 1, note: '' };
      const ids = [...new Set(new FormData(form).getAll('couponConfigIds').map(value => String(value || '').trim()).filter(Boolean))];
      const quantities = Object.fromEntries([...form.querySelectorAll('input[name="couponQuantities"]')].map(input => [input.dataset.couponId, input.value]));
      const activityId = String(new FormData(form).get('activityId') || current.activityId || '').trim();
      if (action === 'manual-grant-remove-coupon') ids.splice(Math.max(0, Number(node.dataset.index) || 0), 1);
      if (action === 'manual-grant-add-coupon') {
        const available = state.couponConfigs.filter(config => (config.activityIds || []).includes(activityId));
        const next = available.find(config => !ids.includes(config.id));
        if (next) ids.push(next.id);
      }
      ids.forEach(couponId => { if (quantities[couponId] === undefined) quantities[couponId] = current.couponQuantities?.[couponId] ?? 1; });
      Object.keys(quantities).forEach(couponId => { if (!ids.includes(couponId)) delete quantities[couponId]; });
      state.ui.manualGrantDraft = { ...current, activityId, couponConfigIds: ids, couponConfigId: ids[0] || '', couponQuantities: quantities };
      render();
      return;
    }
    if (action === 'activity-detail') { state.ui.modal = { type: 'activity-detail', id }; render(); return; }
    if (action === 'activity-associated-coupon') { openCouponModal(id, true); return; }
    if (action === 'activity-associated-cdk') { state.ui.modal = { type: 'cdk-detail', id }; render(); return; }
    if (action === 'activity-edit') { const activity = getActivity(id); if (!canEditActivity(activity)) { showToast('已停用或已过期活动不可编辑', 'warning'); return; } state.ui.activityDraft = null; state.ui.modal = { type: 'activity-form', id, variant: activity?.type === 'recharge' ? 'stored' : 'other' }; render(); return; }
    if (action === 'activity-copy') { copyActivity(id); return; }
    if (action === 'activity-stop') { openConfirm('停用这个活动？', '停用后不会再触发新的发放，已到账券实例和历史记录不受影响。', 'stop-activity', id, true); return; }
    if (action === 'activity-enable') { const activity = getActivity(id); if (activity && activity.status === 'offline') { activity.status = 'running'; showToast('活动已启用', 'success'); } render(); return; }
    if (action === 'activity-delete') { const activity = getActivity(id); if (!activity || !['ended', 'offline'].includes(activity.status)) { showToast('只有已结束或已停用的活动可以删除', 'warning'); return; } const statusLabel = activity.status === 'ended' ? '已结束' : '已停用'; openConfirm(`删除${statusLabel}活动“${activity.name}”？`, '删除后会解除关联的优惠券配置；已产生的发放、领取和核销记录保留。此操作不可恢复。', 'delete-activity', id, true); return; }
    if (action === 'activity-detail-tab') { switchViewUnit(() => { state.ui.activityTab = node.dataset.tab; }); return; }
    if (action === 'activity-records') { navigate('records', { tab: node.dataset.tab || 'grant' }, () => { state.ui.recordFilter.activityId = id; }); return; }
    if (action === 'template-from-activity') { navigate('templates'); return; }
    if (action === 'template-edit') { const template = getTemplate(id); if (!template) return; if (template.source === 'default') { showToast('默认模板不可编辑，可通过“由模板新增”创建优惠券', 'warning'); return; } state.ui.templateDraft = clone(template); state.ui.modal = { type: 'template-form', id }; render(); return; }
    if (action === 'template-create-coupon') { createCouponFromTemplate(id); return; }
    if (action === 'template-delete') { const template = getTemplate(id); if (!template || template.source === 'default') { showToast('默认模板不支持删除', 'warning'); return; } openConfirm('删除这个券模板？', '删除后不可恢复。已生成的优惠券配置和顾客券实例保留发放时的规则快照，不受本次删除影响。', 'delete-template', id, true); return; }
    if (action === 'template-preset') { syncTemplateDraftFromForm(node.closest('form')); const current = state.ui.templateDraft || blankTemplateDraft(); const config = templatePresetConfig(node.dataset.preset); state.ui.templateDraft = { ...current, ...config, name: current.name && current.name !== blankTemplateDraft().name ? current.name : config.name, preset: node.dataset.preset }; render(); return; }
    if (action === 'template-calc' || action === 'template-eligibility' || action === 'template-validity' || action === 'template-usage') { syncTemplateDraftFromForm(node.closest('form')); const draft = state.ui.templateDraft || blankTemplateDraft(); if (action === 'template-calc') draft.calcMethod = node.dataset.value; if (action === 'template-eligibility') draft.eligibility = node.dataset.value; if (action === 'template-validity') draft.validityMode = node.dataset.value; if (action === 'template-usage') draft.usageMode = node.dataset.value; state.ui.templateDraft = draft; render(); return; }
    if (action === 'save-activity') { saveActivity(); return; }
    if (action === 'save-template') { saveTemplate(); return; }
    if (action === 'save-coupon') {
      const form = node.closest('form[data-form="coupon-config"]');
      if (form) {
        state.ui.couponDraft = collectCouponDraft(form);
        state.ui.modal = { type: 'coupon-publish-confirm' };
        render();
      }
      return;
    }
    if (action === 'coupon-publish-with-template') {
      const draft = clone(state.ui.couponDraft || blankCouponDraft());
      if (saveCouponAsTemplate({ draft, navigate: false, silent: true })) saveCoupon(draft);
      return;
    }
    if (action === 'coupon-publish-without-template') {
      saveCoupon(clone(state.ui.couponDraft || blankCouponDraft()));
      return;
    }
    if (action === 'save-coupon-as-template') { saveCouponAsTemplate(); return; }
    if (action === 'activity-type-preset') { syncActivityDraftFromForm(node.closest('form')); const draft = state.ui.activityDraft || blankActivityDraft(); const value = node.dataset.value; draft.type = value === 'new_customer' ? 'new_customer' : 'recharge'; draft.rechargeMode = value === 'recharge_limited' ? 'limited' : 'regular'; draft.sceneCategory = draft.type === 'new_customer' ? 'customer_identity' : 'customer_behavior'; if (draft.type === 'recharge' && !draft.tiers?.length) draft.tiers = blankActivityDraft().tiers; state.ui.activityDraft = draft; render(); return; }
    if (action === 'coupon-preset' && isTemplateEditorForm(node.closest('form'))) { const form = node.closest('form'); syncCouponEditorDraftFromForm(form); const current = couponEditorDraftForForm(form); const presetKey = node.dataset.preset; const preset = templatePresetConfig(presetKey); const next = { ...current, ...clone(preset), preset: presetKey, templateId: '' }; saveCouponEditorDraft(form, next); state.ui.templateAdvancedExpanded = presetKey === 'custom'; renderCouponEditorSurface(form); return; }
    if (action === 'coupon-advanced-toggle' && isTemplateEditorForm(node.closest('form'))) { const form = node.closest('form'); syncCouponEditorDraftFromForm(form); const draft = couponEditorDraftForForm(form); const currentExpanded = state.ui.templateAdvancedExpanded === null ? couponTypePresetKey(draft) === 'custom' : state.ui.templateAdvancedExpanded; state.ui.templateAdvancedExpanded = !currentExpanded; renderCouponEditorSurface(form); return; }
    if (action === 'scope-option' && isTemplateEditorForm(node.closest('form'))) { const form = node.closest('form'); syncCouponEditorDraftFromForm(form); const draft = couponEditorDraftForForm(form); draft.scopeSelections = normalizeCouponScopeSelections(draft); const index = Number(node.dataset.scopeIndex); const selection = draft.scopeSelections[index]; if (selection) { const field = node.dataset.scopeField; if (node.dataset.scopeGame !== undefined) selection.game = node.dataset.scopeGame; if (node.dataset.scopeCategory !== undefined) selection.category = node.dataset.scopeCategory; selection[field] = node.dataset.scopeValue || ''; if (field === 'game') { selection.category = ''; selection.product = ''; } if (field === 'category') selection.product = ''; } saveCouponEditorDraft(form, draft); renderCouponEditorSurface(form); return; }
    if (action === 'scope-add' && isTemplateEditorForm(node.closest('form'))) { const form = node.closest('form'); syncCouponEditorDraftFromForm(form); const draft = couponEditorDraftForForm(form); draft.scopeSelections = normalizeCouponScopeSelections(draft); draft.scopeSelections.push({ game: '', category: '', product: '' }); saveCouponEditorDraft(form, draft); renderCouponEditorSurface(form); return; }
    if (action === 'scope-remove' && isTemplateEditorForm(node.closest('form'))) { const form = node.closest('form'); syncCouponEditorDraftFromForm(form); const draft = couponEditorDraftForForm(form); const selections = normalizeCouponScopeSelections(draft); selections.splice(Number(node.dataset.index), 1); draft.scopeSelections = selections.length ? selections : [{ game: '', category: '', product: '' }]; saveCouponEditorDraft(form, draft); renderCouponEditorSurface(form); return; }
    if ((action === 'coupon-calc' || action === 'coupon-eligibility' || action === 'coupon-validity' || action === 'coupon-usage') && isTemplateEditorForm(node.closest('form'))) { const form = node.closest('form'); syncCouponEditorDraftFromForm(form); const draft = couponEditorDraftForForm(form); if (action === 'coupon-calc') { draft.calcMethod = node.dataset.value; if (draft.calcMethod === 'discount') { draft.usageMode = 'single'; if (!num(draft.discountRate)) draft.discountRate = 80; } if (draft.calcMethod === 'fixed' && !num(draft.amount)) draft.amount = 20; } if (action === 'coupon-eligibility') draft.eligibility = node.dataset.value; if (action === 'coupon-validity') draft.validityMode = node.dataset.value; if (action === 'coupon-usage') { draft.usageMode = node.dataset.value; if (draft.usageMode === 'multi' && num(draft.maxUses) < 2) draft.maxUses = 2; } saveCouponEditorDraft(form, draft); renderCouponEditorSurface(form); return; }
    if (action === 'coupon-preset') { syncCouponDraftFromForm(node.closest('form')); const current = state.ui.couponDraft || blankCouponDraft(); const presetKey = node.dataset.preset; const preset = templatePresetConfig(presetKey); const selected = COUPON_TYPE_PRESETS.find(item => item.key === presetKey); const currentTemplate = getTemplate(current.templateId); const keepName = Boolean(current.name && current.name !== currentTemplate?.name); const keepDescription = Boolean(current.description && current.description !== currentTemplate?.description); const customTemplate = presetKey === 'custom' ? state.templates.find(item => item.source === 'custom' && item.status !== 'offline') : null; const nextTemplateId = presetKey === 'custom' ? (currentTemplate?.source === 'custom' ? currentTemplate.id : customTemplate?.id || '') : selected?.templateId || current.templateId; const selectedTemplate = getTemplate(nextTemplateId); const selectedTemplateRules = presetKey === 'custom' && selectedTemplate ? { calcMethod: selectedTemplate.calcMethod, amount: selectedTemplate.amount, threshold: selectedTemplate.threshold, discountRate: selectedTemplate.discountRate, maxDiscount: selectedTemplate.maxDiscount, eligibility: selectedTemplate.eligibility, sceneTags: clone(selectedTemplate.sceneTags || []), scopeGames: clone(selectedTemplate.scopeGames || []), scopeServices: clone(selectedTemplate.scopeServices || []), validityMode: selectedTemplate.validityMode, validDays: selectedTemplate.validDays, fixedStart: selectedTemplate.fixedStart, fixedEnd: selectedTemplate.fixedEnd, usageMode: selectedTemplate.usageMode, totalAmount: selectedTemplate.totalAmount, maxUses: selectedTemplate.maxUses } : preset; state.ui.couponDraft = { ...current, ...clone(selectedTemplateRules), preset: presetKey, templateId: nextTemplateId, name: keepName ? current.name : (presetKey === 'custom' ? selectedTemplate?.name || '' : ''), description: keepDescription ? current.description : (presetKey === 'custom' ? selectedTemplate?.description || '' : '') }; state.ui.couponAdvancedExpanded = presetKey === 'custom'; renderCouponSurface(); return; }
    if (action === 'coupon-advanced-toggle') { const form = node.closest('form'); if (form) syncCouponDraftFromForm(form); const draft = state.ui.couponDraft || blankCouponDraft(); const defaultExpanded = couponTypePresetKey(draft) === 'custom'; const currentExpanded = state.ui.couponAdvancedExpanded === null ? defaultExpanded : state.ui.couponAdvancedExpanded; state.ui.couponAdvancedExpanded = !currentExpanded; renderCouponSurface(); return; }
    if (action === 'scope-option') { const form = node.closest('form'); syncCouponDraftFromForm(form); const draft = state.ui.couponDraft || blankCouponDraft(); draft.scopeSelections = normalizeCouponScopeSelections(draft); const index = Number(node.dataset.scopeIndex); const selection = draft.scopeSelections[index]; if (selection) { const field = node.dataset.scopeField; if (node.dataset.scopeGame !== undefined) selection.game = node.dataset.scopeGame; if (node.dataset.scopeCategory !== undefined) selection.category = node.dataset.scopeCategory; selection[field] = node.dataset.scopeValue || ''; if (field === 'game') { selection.category = ''; selection.product = ''; } if (field === 'category') selection.product = ''; } state.ui.couponDraft = draft; renderCouponSurface(); return; }
    if (action === 'scope-add') { syncCouponDraftFromForm(node.closest('form')); const draft = state.ui.couponDraft || blankCouponDraft(); draft.scopeSelections = normalizeCouponScopeSelections(draft); draft.scopeSelections.push({ game: '', category: '', product: '' }); state.ui.couponDraft = draft; renderCouponSurface(); return; }
    if (action === 'scope-remove') { syncCouponDraftFromForm(node.closest('form')); const draft = state.ui.couponDraft || blankCouponDraft(); const selections = normalizeCouponScopeSelections(draft); selections.splice(Number(node.dataset.index), 1); draft.scopeSelections = selections.length ? selections : [{ game: '', category: '', product: '' }]; state.ui.couponDraft = draft; renderCouponSurface(); return; }
    if (action === 'coupon-calc' || action === 'coupon-eligibility' || action === 'coupon-validity' || action === 'coupon-usage') { syncCouponDraftFromForm(node.closest('form')); const draft = state.ui.couponDraft || blankCouponDraft(); if (action === 'coupon-calc') { draft.calcMethod = node.dataset.value; if (draft.calcMethod === 'discount') { draft.usageMode = 'single'; if (!num(draft.discountRate)) draft.discountRate = 80; } if (draft.calcMethod === 'fixed' && !num(draft.amount)) draft.amount = 20; } if (action === 'coupon-eligibility') draft.eligibility = node.dataset.value; if (action === 'coupon-validity') draft.validityMode = node.dataset.value; if (action === 'coupon-usage') { draft.usageMode = node.dataset.value; if (draft.usageMode === 'multi' && num(draft.maxUses) < 2) draft.maxUses = 2; } state.ui.couponDraft = draft; renderCouponSurface(); return; }
    if (action === 'associate-activities') { state.ui.associationContext = { target: 'coupon-activities', ownerId: id }; navigate('activities', { tab: 'stored-value' }); return; }
    if (action === 'associate-coupons-from-activity') { state.ui.associationContext = { target: 'activity-coupon', ownerId: id }; navigate('coupon-form'); return; }
    if (action === 'select-associated-activity') { const config = getCouponConfig(state.ui.associationContext?.ownerId); const activity = getActivity(id); if (config && activity) { config.activityIds = [...new Set([...(config.activityIds || []), activity.id])]; activity.couponIds = [...new Set([...(activity.couponIds || []), config.id])]; } state.ui.associationContext = null; showToast('活动关联已更新', 'success'); navigate('coupon-form'); return; }
    if (action === 'select-associated-coupon') { const context = state.ui.associationContext; const config = getCouponConfig(id); if (!context || !config || context.target !== 'activity-coupon') return; const activity = getActivity(context.ownerId); if (activity) { activity.couponIds = [...new Set([...(activity.couponIds || []), config.id])]; config.activityIds = [...new Set([...(config.activityIds || []), activity.id])]; } showToast('优惠券配置已关联到活动', 'success'); navigate('activity-detail', { id: context.ownerId }); return; }
    if (action === 'record-tab') { navigate('records', { tab: node.dataset.tab }, () => { state.ui.recordTab = node.dataset.tab; state.ui.recordFilter.status = 'all'; }); return; }
    if (action === 'record-range') { switchViewUnit(() => { state.ui.recordFilter.range = node.dataset.value || '30d'; state.ui.recordFilter.dateStart = ''; state.ui.recordFilter.dateEnd = ''; }); return; }
    if (action === 'record-filter-reset') { switchViewUnit(() => { state.ui.recordFilter = { ...state.ui.recordFilter, q: '', customer: '', status: 'all', source: 'all', couponConfigId: '', activityId: '', range: '30d', dateStart: '', dateEnd: '', fromDashboard: false }; }); return; }
    if (action === 'record-detail') { state.ui.modal = { type: 'record', id }; render(); return; }
    if (action === 'dashboard-range') { switchViewUnit(() => { state.ui.dashboardFilter.range = node.dataset.value; state.ui.dashboardActivityPage = 1; }); return; }
    if (action === 'distribution-tab') { navigate('distribution-management', { tab: node.dataset.tab || 'cdk' }); return; }
    if (action === 'dashboard-activity-page-number' || action === 'dashboard-activity-page-prev' || action === 'dashboard-activity-page-next') { switchViewUnit(() => { state.ui.dashboardActivityPage = Math.max(1, Number(node.dataset.page) || 1); }); return; }
    if (action === 'dashboard-records') { openDashboardRecords({ recordType: node.dataset.recordType || 'grant' }); return; }
    if (action === 'dashboard-metric') { openDashboardRecords({ recordType: node.dataset.recordType || 'grant' }); return; }
    if (action === 'dashboard-trend-point') { openDashboardRecords({ recordType: node.dataset.recordType || 'grant', period: { start: node.dataset.start, end: node.dataset.end } }); return; }
    if (action === 'dashboard-source-drill') { openDashboardRecords({ recordType: node.dataset.recordType || 'grant', sourceOverride: node.dataset.source }); return; }
    if (action === 'dashboard-activity-detail') { state.ui.dashboardActivityExpanded = state.ui.dashboardActivityExpanded === node.dataset.id ? null : node.dataset.id; render(); return; }
    if (action === 'dashboard-activity-records') { openDashboardRecords({ recordType: 'grant', activityOverride: node.dataset.id }); return; }
    if (action === 'dashboard-refresh') { state.ui.dashboardLastUpdated = dashboardRefreshTimestamp(); render(); showToast('看板数据已刷新', 'success'); return; }
    if (action === 'clear-record-activity') { switchViewUnit(() => { state.ui.recordFilter.activityId = ''; }); return; }
    if (action === 'clear-record-coupon') { switchViewUnit(() => { state.ui.recordFilter.couponConfigId = ''; }); return; }
  }

  document.addEventListener('click', event => {
    const routeNode = event.target.closest('[data-route]');
    if (routeNode) {
      event.preventDefault();
      if (routeNode.dataset.action) { handleAction(routeNode); return; }
      const hasModalState = Boolean(state.ui.modal);
      if (!hasModalState && routeNode.dataset.route === 'activity-form') state.ui.activityDraft = null;
      if (!hasModalState && routeNode.dataset.route === 'coupon-form') state.ui.couponDraft = null;
      navigate(routeNode.dataset.route);
      return;
    }
    const actionNode = event.target.closest('[data-action]');
    if (actionNode) { event.preventDefault(); handleAction(actionNode); }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const row = event.target.closest('[data-action="dashboard-activity-detail"]');
    if (row) { event.preventDefault(); handleAction(row); }
  });
  document.addEventListener('submit', event => {
    const form = event.target;
    if (form.dataset.search === 'activities') { event.preventDefault(); switchViewUnit(() => { state.ui.activityFilter.q = new FormData(form).get('q') || ''; state.ui.activityPage = 1; }); return; }
    if (form.dataset.search === 'cdk') { event.preventDefault(); switchViewUnit(() => { state.ui.cdkFilter.q = new FormData(form).get('q') || ''; state.ui.cdkPage = 1; }); return; }
    if (form.dataset.search === 'templates') { event.preventDefault(); switchViewUnit(() => { state.ui.templateFilter.q = new FormData(form).get('q') || ''; state.ui.templatePage = 1; }); return; }
    if (form.dataset.search === 'records') { event.preventDefault(); switchViewUnit(() => { state.ui.recordFilter.q = new FormData(form).get('q') || ''; }); return; }
    if (form.dataset.search === 'record-customer') { event.preventDefault(); switchViewUnit(() => { state.ui.recordFilter.customer = new FormData(form).get('customer') || ''; }); return; }
    if (form.dataset.search === 'coupons') { event.preventDefault(); switchViewUnit(() => { state.ui.couponFilter.q = new FormData(form).get('q') || ''; state.ui.couponPage = 1; }); return; }
    if (form.dataset.form === 'activity') { event.preventDefault(); saveActivity(); return; }
    if (form.dataset.form === 'template-modal' || form.dataset.form === 'template') { event.preventDefault(); saveTemplate(); }
    if (form.dataset.form === 'coupon-config') { event.preventDefault(); state.ui.couponDraft = collectCouponDraft(form); state.ui.modal = { type: 'coupon-publish-confirm' }; render(); return; }
    if (form.dataset.form === 'manual-grant' || form.dataset.form === 'manual-grant-page') { event.preventDefault(); saveManualGrant(); return; }
    if (form.dataset.form === 'cdk-batch') { event.preventDefault(); saveCdkBatch(); return; }
  });
  document.addEventListener('change', event => {
    const node = event.target;
    const manualGrantPage = node.closest('form[data-form="manual-grant-page"]');
    if (manualGrantPage && ['activityId', 'couponConfigIds', 'couponConfigId', 'couponQuantities', 'quantity'].includes(node.name)) {
      const current = state.ui.manualGrantDraft || { activityId: '', couponConfigIds: [], couponConfigId: '', couponQuantities: {}, customerId: '', quantity: 1, note: '' };
      const couponSelects = [...manualGrantPage.querySelectorAll('select[name="couponConfigIds"]')];
      const quantityInputs = [...manualGrantPage.querySelectorAll('input[name="couponQuantities"]')];
      const selectedCouponIds = node.name === 'activityId' ? [] : [...new Set(couponSelects.map(select => String(select.value || '').trim()).filter(Boolean))];
      const couponQuantities = {};
      couponSelects.forEach((select, index) => {
        const couponId = String(select.value || '').trim();
        if (!couponId) return;
        couponQuantities[couponId] = quantityInputs[index]?.value ?? current.couponQuantities?.[couponId] ?? 1;
      });
      state.ui.manualGrantDraft = { ...current, ...(node.name === 'activityId' ? { activityId: node.value, couponConfigIds: [], couponConfigId: '', couponQuantities: {} } : node.name === 'quantity' ? { quantity: Math.max(1, Math.min(99, Math.floor(num(node.value, 1)))) } : { couponConfigIds: selectedCouponIds, couponConfigId: selectedCouponIds[0] || '', couponQuantities }) };
      render();
      return;
    }
    const cdkBatchForm = node.closest('form[data-form="cdk-batch"]');
    if (cdkBatchForm && node.name === 'codeMode') {
      state.ui.cdkBatchDraft = collectCdkBatchDraft(cdkBatchForm);
      render();
      return;
    }
    const activityForm = node.closest('form[data-form="activity"]');
    if (activityForm && node.dataset.activityTimeLongTerm !== undefined) {
      syncActivityDraftFromForm(activityForm);
      const draft = state.ui.activityDraft || blankActivityDraft();
      draft.start = node.checked ? '长期' : '';
      draft.end = node.checked ? '长期' : '';
      draft.windowStart = draft.start;
      draft.windowEnd = draft.end;
      state.ui.activityDraft = draft;
      render();
      return;
    }
    if (activityForm && node.name === 'limitReceive') {
      syncActivityDraftFromForm(activityForm);
      const draft = state.ui.activityDraft || blankActivityDraft();
      draft.limitReceive = node.checked;
      if (!node.checked) draft.perUserLimit = 0;
      state.ui.activityDraft = draft;
      render();
      return;
    }
    if (activityForm && node.name === 'showInRechargeCenter') {
      syncActivityDraftFromForm(activityForm);
      render();
      return;
    }
    if (activityForm && node.name === 'couponIds') {
      const previousDraft = clone(state.ui.activityDraft || blankActivityDraft());
      syncActivityDraftFromForm(activityForm);
      const draft = state.ui.activityDraft || blankActivityDraft();
      const previousCouponIds = (previousDraft.couponIds || []).filter(Boolean);
      const currentCouponIds = (draft.couponIds || []).filter(Boolean);
      const previousCouponSet = new Set(previousCouponIds);
      const currentCouponSet = new Set(currentCouponIds);
      const addedCouponIds = currentCouponIds.filter(couponId => !previousCouponSet.has(couponId));
      const removedCouponIds = new Set(previousCouponIds.filter(couponId => !currentCouponSet.has(couponId)));
      if (draft.type === 'recharge' || draft.triggerMode === 'recharge') {
        const upperCoupons = (draft.couponIds || []).map((couponId, index) => ({ couponId, qty: draft.couponQuantities?.[index] ?? 100 }));
        draft.tiers = (draft.tiers || []).map(tier => { let claimCoupons = activityTierClaimCoupons(tier, upperCoupons).filter(item => !removedCouponIds.has(item.couponId)); addedCouponIds.forEach(couponId => { if (claimCoupons.some(item => item.couponId === couponId)) return; const blankIndex = claimCoupons.findIndex(item => !item.couponId); if (blankIndex >= 0) claimCoupons[blankIndex] = { couponId, limit: 1 }; else claimCoupons.push({ couponId, limit: 1 }); }); if (!claimCoupons.length) claimCoupons = [{ couponId: '', limit: 1 }]; return { ...tier, coupons: upperCoupons, claimCoupons }; });
        state.ui.activityDraft = draft;
        refreshActivityFormEditor(activityForm);
        return;
      }
      const claimRows = (draft.couponClaimIds || []).map((couponId, index) => ({ couponId, limit: Math.max(1, Math.min(9999, Math.floor(num(draft.couponClaimLimits?.[index], 1)))) }));
      let nextClaimRows = claimRows.filter(row => !removedCouponIds.has(row.couponId));
      if (!currentCouponIds.length) nextClaimRows = [];
      else {
        if (addedCouponIds.length && nextClaimRows.every(row => !row.couponId)) nextClaimRows = [];
        addedCouponIds.forEach(couponId => {
          if (nextClaimRows.some(row => row.couponId === couponId)) return;
          const blankRowIndex = nextClaimRows.findIndex(row => !row.couponId);
          if (blankRowIndex >= 0) nextClaimRows[blankRowIndex] = { couponId, limit: 1 };
          else nextClaimRows.push({ couponId, limit: 1 });
        });
      }
      draft.couponClaimIds = nextClaimRows.map(row => row.couponId);
      draft.couponClaimLimits = nextClaimRows.map(row => row.limit);
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(activityForm);
      return;
    }
    if (activityForm && node.name === 'couponClaimIds') {
      syncActivityDraftFromForm(activityForm);
      const draft = state.ui.activityDraft || blankActivityDraft();
      draft.couponClaimCustomized = true;
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(activityForm);
      return;
    }
    if (activityForm && node.name === 'tierCouponIds') {
      const previousDraft = clone(state.ui.activityDraft || blankActivityDraft());
      syncActivityDraftFromForm(activityForm);
      const draft = state.ui.activityDraft || blankActivityDraft();
      draft.tiers = (draft.tiers || []).map((tier, tierIndex) => {
        const upperCoupons = activityTierCoupons(tier);
        const previousCoupons = activityTierCoupons(previousDraft.tiers?.[tierIndex] || tier);
        const previousIds = new Set(previousCoupons.map(item => item.couponId).filter(Boolean));
        const currentIds = new Set(upperCoupons.map(item => item.couponId).filter(Boolean));
        const removedIds = new Set([...previousIds].filter(couponId => !currentIds.has(couponId)));
        const addedIds = [...currentIds].filter(couponId => !previousIds.has(couponId));
        let claimCoupons = activityTierClaimCoupons(tier, upperCoupons).filter(item => !removedIds.has(item.couponId));
        addedIds.forEach(couponId => {
          if (claimCoupons.some(item => item.couponId === couponId)) return;
          const blankIndex = claimCoupons.findIndex(item => !item.couponId);
          if (blankIndex >= 0) claimCoupons[blankIndex] = { couponId, limit: 1 };
          else claimCoupons.push({ couponId, limit: 1 });
        });
        if (!upperCoupons.some(item => item.couponId)) claimCoupons = [{ couponId: '', limit: 1 }];
        if (!claimCoupons.length) claimCoupons = [{ couponId: '', limit: 1 }];
        return { ...tier, claimCoupons };
      });
      state.ui.activityDraft = draft;
      refreshActivityFormEditor(activityForm);
      return;
    }
    if (activityForm && node.name === 'tierClaimCouponIds') {
      syncActivityDraftFromForm(activityForm);
      refreshActivityFormEditor(activityForm);
      return;
    }
    if (activityForm) {
      updateActivityPreview(activityForm);
      return;
    }
    const filter = node.dataset.filter;
    if (filter === 'activity-status') { switchViewUnit(() => { state.ui.activityFilter.status = node.value; state.ui.activityPage = 1; }); return; }
    if (filter === 'cdk-status') { switchViewUnit(() => { state.ui.cdkFilter.status = node.value; state.ui.cdkPage = 1; }); return; }
    if (filter === 'activity-type') { switchViewUnit(() => { state.ui.activityFilter.type = node.value; state.ui.activityPage = 1; }); return; }
    if (filter === 'activity-trigger') { switchViewUnit(() => { state.ui.activityFilter.trigger = node.value; state.ui.activityPage = 1; }); return; }
    if (filter === 'activity-duration') { switchViewUnit(() => { state.ui.activityFilter.duration = node.value; state.ui.activityPage = 1; }); return; }
    if (filter === 'activity-page-size') { switchViewUnit(() => { state.ui.activityPageSize = Number(node.value) || 10; state.ui.activityPage = 1; }); return; }
    if (filter === 'cdk-page-size') { switchViewUnit(() => { state.ui.cdkPageSize = Number(node.value) || 10; state.ui.cdkPage = 1; }); return; }
    if (filter === 'coupon-page-size') { switchViewUnit(() => { state.ui.couponPageSize = Number(node.value) || 10; state.ui.couponPage = 1; }); return; }
    if (filter === 'template-page-size') { switchViewUnit(() => { state.ui.templatePageSize = Number(node.value) || 10; state.ui.templatePage = 1; }); return; }
    if (filter === 'coupon-template') { switchViewUnit(() => { state.ui.couponFilter.templateId = node.value; state.ui.couponPage = 1; }); return; }
    if (node.name === 'eligibility' && node.closest('form[data-form="template-modal"]')) { syncTemplateDraftFromForm(node.closest('form')); return; }
    if (node.name === 'eligibility' && node.closest('form[data-form="coupon-config"]')) { syncCouponDraftFromForm(node.closest('form')); renderCouponSurface(); return; }
    if (filter === 'dashboard-activity-group') { switchViewUnit(() => { state.ui.dashboardFilter.activityGroup = node.value; state.ui.dashboardFilter.activityType = node.value === 'recharge' ? 'recharge' : 'all'; state.ui.dashboardFilter.activity = 'all'; state.ui.dashboardActivityPage = 1; }); return; }
    if (filter === 'dashboard-activity-type') { switchViewUnit(() => { state.ui.dashboardFilter.activityType = node.value; state.ui.dashboardFilter.activity = 'all'; state.ui.dashboardActivityPage = 1; }); return; }
    if (filter === 'dashboard-activity') { switchViewUnit(() => { state.ui.dashboardFilter.activity = node.value; }); return; }
    if (filter === 'dashboard-coupon') { switchViewUnit(() => { state.ui.dashboardFilter.coupon = node.value; state.ui.dashboardActivityPage = 1; }); return; }
    if (filter === 'dashboard-source') { switchViewUnit(() => { state.ui.dashboardFilter.source = node.value; state.ui.dashboardActivityPage = 1; }); return; }
    if (filter === 'record-source') { switchViewUnit(() => { state.ui.recordFilter.source = node.value; }); return; }
    if (filter === 'record-status') { switchViewUnit(() => { state.ui.recordFilter.status = node.value; }); return; }
    if (filter === 'record-activity') { switchViewUnit(() => { state.ui.recordFilter.activityId = node.value; }); return; }
    if (filter === 'record-coupon') { switchViewUnit(() => { state.ui.recordFilter.couponConfigId = node.value; }); return; }
    if (filter === 'record-date-start' || filter === 'record-date-end') { switchViewUnit(() => { state.ui.recordFilter[filter === 'record-date-start' ? 'dateStart' : 'dateEnd'] = node.value; state.ui.recordFilter.range = 'custom'; }); return; }
    if (node.dataset.scopeField && node.closest('form[data-form="template-modal"]')) { const form = node.closest('form'); syncTemplateDraftFromForm(form); const draft = state.ui.templateDraft || blankTemplateDraft(); const row = node.closest('.scope-row'); const index = Array.from(form.querySelectorAll('.scope-row')).indexOf(row); const selection = draft.scopeSelections?.[index]; if (selection && node.dataset.scopeField === 'game') { selection.category = ''; selection.product = ''; } if (selection && node.dataset.scopeField === 'category') selection.product = ''; state.ui.templateDraft = draft; return; }
    if (node.dataset.scopeField && node.closest('form[data-form="coupon-config"]')) { const form = node.closest('form'); syncCouponDraftFromForm(form); const draft = state.ui.couponDraft || blankCouponDraft(); const row = node.closest('.scope-row'); const index = Array.from(form.querySelectorAll('.scope-row')).indexOf(row); const selection = draft.scopeSelections?.[index]; if (selection && node.dataset.scopeField === 'game') { selection.category = ''; selection.product = ''; } if (selection && node.dataset.scopeField === 'category') selection.product = ''; state.ui.couponDraft = draft; renderCouponSurface(); return; }
    if ((node.name === 'scopeGames' || node.name === 'scopeServices') && node.closest('form[data-form="template-modal"]')) { syncTemplateDraftFromForm(node.closest('form')); return; }
    if ((node.name === 'scopeGames' || node.name === 'scopeServices') && node.closest('form[data-form="coupon-config"]')) { syncCouponDraftFromForm(node.closest('form')); renderCouponSurface(); return; }
    if (node.name === 'templateId' && node.closest('form[data-form="coupon-config"]')) { const form = node.closest('form'); const draft = collectCouponDraft(form); const template = getTemplate(node.value); state.ui.couponDraft = { ...draft, ...(template ? clone(template) : {}), templateId: node.value, id: form.dataset.id || draft.id || '', preset: draft.preset || template?.preset || 'custom' }; renderCouponSurface(); return; }
  });
  document.addEventListener('input', event => {
    const node = event.target;
    const manualGrantPage = node.closest('form[data-form="manual-grant-page"]');
    if (manualGrantPage && ['customerId', 'quantity', 'note'].includes(node.name)) {
      state.ui.manualGrantDraft = { ...state.ui.manualGrantDraft, [node.name]: node.name === 'quantity' ? node.value : node.value };
    }
    if (manualGrantPage && node.name === 'couponQuantities') {
      const current = state.ui.manualGrantDraft || { couponQuantities: {} };
      state.ui.manualGrantDraft = { ...current, couponQuantities: { ...(current.couponQuantities || {}), [node.dataset.couponId]: node.value } };
    }
    const activityForm = node.closest('form[data-form="activity"]');
    if (activityForm) updateActivityPreview(activityForm);
    const templateForm = node.closest('form[data-form="template-modal"]');
    if (templateForm && (node.name === 'name' || node.name === 'description' || node.name === 'amount' || node.name === 'maxUses')) {
      state.ui.templateDraft = collectTemplateDraft(templateForm);
      return;
    }
    const couponForm = node.closest('form[data-form="coupon-config"]');
    if (couponForm && (node.name === 'name' || node.name === 'description')) {
      state.ui.couponDraft = collectCouponDraft(couponForm);
      if (node.name === 'name') {
        const previewTitle = document.querySelector('.coupon-preview-card .preview-title');
        if (previewTitle) previewTitle.textContent = node.value.trim() || '未命名优惠券';
      } else {
        const descriptionRow = [...document.querySelectorAll('.coupon-preview-card .preview-row')].find(row => row.firstElementChild?.textContent === '优惠券描述');
        const previewDescription = descriptionRow?.querySelector('strong');
        if (previewDescription) previewDescription.textContent = node.value.trim() || '—';
      }
      return;
    }
    const usageForm = node.closest('form[data-form="coupon-config"], form[data-form="template-modal"]');
    if (usageForm && (node.name === 'amount' || node.name === 'maxUses')) {
      const amount = num(usageForm.elements.amount?.value, 0);
      const maxUsesValue = Number(usageForm.elements.maxUses?.value);
      const result = usageForm.querySelector('[data-per-use-amount]');
      if (result) {
        const valid = amount > 0 && Number.isInteger(maxUsesValue) && maxUsesValue >= 2;
        const divisible = valid && amountCanSplitEvenly(amount, maxUsesValue);
        result.textContent = valid ? (divisible ? `每次优惠 ${money(amountPerUse(amount, maxUsesValue))}` : '无法平均分配，请调整金额或次数') : '—';
        result.classList.toggle('field-error', valid && !divisible);
      }
      return;
    }
    if (!node.dataset.scopeSearch || !node.closest('form[data-form="coupon-config"], form[data-form="template-modal"]')) return;
    const query = String(node.value || '').trim().toLowerCase();
    node.closest('.scope-cascade-picker')?.querySelectorAll('.scope-menu-node').forEach(menuNode => {
      menuNode.hidden = Boolean(query && !menuNode.dataset.searchText.toLowerCase().includes(query));
    });
  });
  document.addEventListener('focusin', event => {
    if (event.target.dataset.scopeSearch) event.target.select();
  });
  window.addEventListener('hashchange', render);
  if (!window.location.hash) window.location.hash = '#activities'; else render();
})();
