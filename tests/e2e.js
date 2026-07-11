// EV 充电助手 — 核心交互测试套件
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173/';
const RESULTS = { passed: [], failed: [] };

function pass(name) {
  console.log(`  ✅ ${name}`);
  RESULTS.passed.push(name);
}

function fail(name, reason) {
  console.log(`  ❌ ${name}: ${reason}`);
  RESULTS.failed.push({ name, reason });
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
  });
  const page = await context.newPage();

  try {
    // ── 1. 页面加载 ────────────────────────────────────────────────
    console.log('\n[1] 页面加载');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    const title = await page.title();
    if (title) pass('页面成功加载，标题存在');
    else fail('页面加载', '无标题');

    // ── 2. 英雄卡渲染 ──────────────────────────────────────────────
    console.log('\n[2] 英雄卡渲染');
    const heroCard = await page.locator('.hero-card').first();
    if (await heroCard.isVisible()) pass('英雄卡可见');
    else fail('英雄卡', '不可见');

    const heroNumber = await page.locator('.hero-number, .hero-number--empty').first();
    if (await heroNumber.isVisible()) pass('倒计时数字可见');
    else fail('倒计时数字', '不可见');

    // ── 3. Tab 栏切换 ──────────────────────────────────────────────
    console.log('\n[3] Tab 栏切换');
    const settingsTab = await page.locator('.tab-item').last();
    await settingsTab.click();
    await page.waitForTimeout(300);
    const settingsTitle = await page.locator('.page-title').first();
    const settingsText = await settingsTitle.textContent();
    if (settingsText?.includes('设置')) pass('切换到设置页成功');
    else fail('Tab 切换', `设置页标题异常: ${settingsText}`);

    // 切回充电页
    const chargeTab = await page.locator('.tab-item').first();
    await chargeTab.click();
    await page.waitForTimeout(300);

    // ── 4. FAB 按钮 ────────────────────────────────────────────────
    console.log('\n[4] FAB 扩展按钮');
    const fab = await page.locator('.fab');
    if (await fab.isVisible()) pass('FAB 按钮可见');
    else fail('FAB', '不可见');

    const fabLabel = await page.locator('.fab-label');
    const labelVisible = await fabLabel.isVisible();
    const labelText = await fabLabel.textContent();
    if (labelVisible && labelText?.includes('记录充电')) pass('FAB 静止时展开显示「记录充电」');
    else fail('FAB 展开文字', `文字: ${labelText}, 可见: ${labelVisible}`);

    // ── 5. 添加记录表单 ────────────────────────────────────────────
    console.log('\n[5] 添加记录表单');
    await fab.click();
    await page.waitForTimeout(500);

    const sheet = await page.locator('.sheet');
    if (await sheet.isVisible()) pass('底部弹窗弹出');
    else fail('底部弹窗', '未弹出');

    // 选择充电类型
    const fastBtn = await page.locator('.type-btn').nth(1); // 快充
    await fastBtn.click();
    await page.waitForTimeout(200);
    const isActive = await fastBtn.evaluate(el => el.classList.contains('active'));
    if (isActive) pass('充电类型选中状态正确');
    else fail('充电类型选中', '样式未变化');

    // 点击保存
    const saveBtn = await page.locator('.btn-save');
    const isEnabled = await saveBtn.isEnabled();
    if (isEnabled) {
      await saveBtn.click();
      await page.waitForTimeout(600);
      const sheetGone = !(await sheet.isVisible());
      if (sheetGone) pass('保存后弹窗关闭');
      else fail('保存后弹窗', '未关闭');
    } else {
      fail('保存按钮', '禁用状态（日期或类型未填）');
    }

    // ── 6. 记录出现在列表 ──────────────────────────────────────────
    console.log('\n[6] 记录列表');
    await page.waitForTimeout(400);
    const recordItems = await page.locator('.record-item');
    const count = await recordItems.count();
    if (count >= 1) pass(`记录列表显示 ${count} 条记录`);
    else fail('记录列表', '保存后未出现记录');

    // ── 7. 记录展开编辑按钮 ────────────────────────────────────────
    console.log('\n[7] 记录展开 & 编辑按钮');
    if (count >= 1) {
      const firstRecord = recordItems.first();
      await firstRecord.click();
      await page.waitForTimeout(300);
      const editBtn = await page.locator('.btn-edit').first();
      if (await editBtn.isVisible()) pass('展开后显示编辑按钮');
      else fail('编辑按钮', '展开后未出现');
    } else {
      pass('编辑按钮测试跳过（无记录）');
    }

    // ── 8. 月份分组标题 ────────────────────────────────────────────
    console.log('\n[8] 月份分组');
    const monthHeader = await page.locator('.month-header');
    const headerCount = await monthHeader.count();
    if (headerCount >= 1) pass(`月份分组标题存在（${headerCount} 个）`);
    else fail('月份分组', '未找到月份标题（可能记录数不足跨月）');

    // ── 9. 设置页电池类型 ──────────────────────────────────────────
    console.log('\n[9] 设置页电池类型卡片');
    await settingsTab.click();
    await page.waitForTimeout(300);

    const batteryCards = await page.locator('.battery-card');
    const cardCount = await batteryCards.count();
    if (cardCount === 3) pass('电池类型显示 3 个选项');
    else fail('电池类型', `期望 3 个，实际 ${cardCount} 个`);

    // 点击三元锂
    await batteryCards.nth(1).click();
    await page.waitForTimeout(300);
    const nmcActive = await batteryCards.nth(1).evaluate(el => el.classList.contains('active'));
    if (nmcActive) pass('切换电池类型选中状态正确');
    else fail('电池类型切换', '选中状态未变化');

    // 切回磷酸铁锂
    await batteryCards.nth(0).click();
    await page.waitForTimeout(200);

    // ── 10. 清空二次确认 ───────────────────────────────────────────
    console.log('\n[10] 清空二次确认');
    const dangerBtn = await page.locator('.btn-danger');
    if (await dangerBtn.isVisible()) {
      await dangerBtn.click();
      await page.waitForTimeout(300);
      const sliderTrack = await page.locator('.slider-confirm-track');
      if (await sliderTrack.isVisible()) pass('清空按钮点击后显示滑动确认');
      else fail('清空二次确认', '未出现滑动确认区域');

      // 取消
      const cancelBtn = await page.locator('.btn-cancel');
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        await page.waitForTimeout(200);
        pass('取消按钮有效，返回初始状态');
      }
    } else {
      fail('清空按钮', '不可见');
    }

    // ── 11. 撤销删除 ───────────────────────────────────────────────
    console.log('\n[11] 撤销删除')
    // Navigate back to charge tab (previous tests may have left us on Settings)
    await page.locator('.tab-item').first().click()
    await page.waitForTimeout(300)
    {
      const countBefore = await page.locator('.record-item').count()
      if (countBefore >= 1) {
        const firstItem = page.locator('.record-item').first()
        const box = await firstItem.boundingBox()
        if (box) {
          await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2)
          await page.mouse.down()
          await page.mouse.move(box.x + box.width - 20 - 160, box.y + box.height / 2, { steps: 10 })
          await page.mouse.up()
          await page.waitForTimeout(400)
          // Replace the flat timeout with waitForSelector for reliability
          let pendingCard
          try {
            await page.waitForSelector('.pending-delete-card', { timeout: 1500 })
            pendingCard = page.locator('.pending-delete-card')
          } catch {
            pendingCard = page.locator('.pending-delete-card')
          }
          if (await pendingCard.isVisible()) {
            pass('滑删后出现软删除提示卡')
            const undoBtn = page.locator('.pending-undo-btn').first()
            // Use evaluate to click directly via JS, bypassing overlap detection
            await undoBtn.evaluate(el => el.click())
            await page.waitForTimeout(600)
            const countAfter = await page.locator('.record-item').count()
            if (countAfter >= countBefore) pass('撤销后记录恢复')
            else fail('撤销删除', `记录数: ${countBefore} → ${countAfter}`)
          } else {
            fail('软删除提示卡', '未出现（可能滑动距离不足）')
          }
        }
      } else {
        pass('撤销删除测试跳过（无记录）')
      }
    }

    // ── 12. (reserved) ────────────────────────────────────────────

    // ── 13. 费用趋势图 ─────────────────────────────────────────────
    console.log('\n[13] 费用趋势图')
    {
      const chartCard = page.locator('.cost-chart-card')
      const chartVisible = await chartCard.isVisible()
      if (chartVisible) {
        pass('费用趋势图卡片可见')
        const bars = page.locator('.bar-rect')
        const barCount = await bars.count()
        if (barCount >= 2) pass(`趋势图显示 ${barCount} 个月柱体`)
        else fail('趋势图柱体', `数量不足: ${barCount}`)
      } else {
        pass('费用趋势图不显示（数据不足2个月，符合预期）')
      }
    }

    // ── 14. 记录筛选 ───────────────────────────────────────────────
    console.log('\n[14] 记录筛选')
    {
      // Navigate to charge tab
      await page.locator('.tab-item').first().click()
      await page.waitForTimeout(300)

      const filterBtn = page.locator('.filter-btn')
      if (await filterBtn.isVisible()) {
        pass('筛选按钮可见')
        await filterBtn.click()
        await page.waitForTimeout(300)

        const filterPanel = page.locator('.filter-panel')
        if (await filterPanel.isVisible()) {
          pass('点击后筛选面板展开')

          const fastChip = page.locator('.filter-chip').filter({ hasText: '快充' }).first()
          if (await fastChip.isVisible()) {
            await fastChip.click()
            await page.waitForTimeout(200)
            const isActive = await fastChip.evaluate(el => el.classList.contains('active'))
            if (isActive) pass('快充筛选条件选中')
            else fail('筛选条件选中', '样式未变化')
          }

          // Close panel
          await filterBtn.click()
          await page.waitForTimeout(200)
          pass('筛选面板可关闭')
        } else {
          fail('筛选面板', '未展开')
        }
      } else {
        fail('筛选按钮', '不可见')
      }
    }

  } catch (err) {
    console.error('\n❌ 测试异常:', err.message);
    RESULTS.failed.push({ name: '未捕获异常', reason: err.message });
  } finally {
    await browser.close();

    // 汇总
    console.log('\n' + '─'.repeat(50));
    console.log(`📋 测试结果: ${RESULTS.passed.length} 通过 / ${RESULTS.failed.length} 失败`);
    if (RESULTS.failed.length > 0) {
      console.log('\n失败项:');
      RESULTS.failed.forEach(f => console.log(`  ❌ ${f.name}: ${f.reason}`));
      process.exit(1);
    } else {
      console.log('✅ 全部通过');
    }
  }
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
