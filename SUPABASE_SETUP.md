# Supabase 接通步骤

1. 打开 Supabase 项目，进入 **Authentication → Sign In / Providers → Anonymous**，启用匿名登录。
2. 进入 **SQL Editor**，新建查询，复制并运行 `supabase/setup.sql` 的全部内容。
3. 在 **Table Editor** 中确认出现 `responses` 和 `reactions` 两张表。
4. 打开网页回答任意问题。首次访问会在浏览器中建立匿名用户，不要求邮箱或密码。

网页只使用 Project URL 和 Publishable Key。不要把 Secret Key 或 `service_role` key 放进网页。

## 内容管理

- 正常回答的 `status` 是 `published`。
- 如需隐藏不适当内容，在 `responses` 表中把对应行的 `status` 改为 `hidden`。
- 每个匿名用户对同一条回答、同一种互动只能记录一次，再次点击会取消。
