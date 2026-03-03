import React from 'react';
import { registerWidget, openApp, a } from 'react-native-android-widget';
import { useUserStore } from '@/store/useUserStore';
import { useTransactionStore } from '@/store/useTransactionStore';

const SmallWidget = () => {
  const { netBalance, primaryCurrency } = useUserStore();
  
  return (
    <a.small_widget_layout
      onClick={openApp}
      childs={[
        <a.TextView id="@+id/tv_balance_label" text="Net Balance" />,
        <a.TextView id="@+id/tv_balance" text={`${primaryCurrency} ${netBalance.toFixed(2)}`} />,
        <a.ImageButton
          id="@+id/btn_quick_add"
          onClick={openApp.withUrl('myapp://quick-add')}
          src="@drawable/ic_add"
        />,
      ]}
    />
  );
};

const MediumWidget = () => {
  const { netBalance, primaryCurrency } = useUserStore();
  const { transactions } = useTransactionStore();

  const todaySpending = transactions
    .filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString())
    .reduce((acc, t) => acc + (t.currency === primaryCurrency ? t.amount : t.amount * 1), 0);

  const lastTransaction = transactions[0] ? `${transactions[0].name}: ${transactions[0].amount}` : 'No recent transactions';

  return (
    <a.medium_widget_layout
      onClick={openApp}
      childs={[
        <a.TextView id="@+id/tv_balance_label" text="Net Balance" />,
        <a.TextView id="@+id/tv_balance" text={`${primaryCurrency} ${netBalance.toFixed(2)}`} />,
        <a.TextView id="@+id/tv_today_spending_label" text="Today's Spending" />,
        <a.TextView id="@+id/tv_today_spending" text={`${primaryCurrency} ${todaySpending.toFixed(2)}`} />,
        <a.TextView id="@+id/tv_last_transaction_label" text="Last Transaction" />,
        <a.TextView id="@+id/tv_last_transaction" text={lastTransaction} />,
      ]}
    />
  );
};

registerWidget('small_widget', 'small', SmallWidget);
registerWidget('medium_widget', 'medium', MediumWidget);
