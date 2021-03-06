import * as React from 'react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BulletCalculatorContext } from '../context/bulletcalc_context';
import { totalBulletCosts, combineDuplicatedInventoryBullets } from '../data/bulletcalc';
import { Card } from '../components/Card';
import { CardButton } from '../components/CardButton';
import { withRouter } from 'react-router';

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  marginBottom: '1em'
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '1.2em',
  fontWeight: 'normal',
  textAlign: 'center',
  marginBottom: '1em'
};

const costListStyle: React.CSSProperties = {
  fontSize: '0.7em',
  width: '20em',
  maxWidth: '90%'
};

const costListItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.8em 0'
};

const costIconStyle: React.CSSProperties = {
  height: '1.5em'
};

const costNameStyle: React.CSSProperties = {
  flex: '1',
  padding: '0 0.5em'
};

const costInputStyle: React.CSSProperties = {
  fontSize: '16px',
  paddingLeft: '1em',
  width: '5em',
  textAlign: 'right'
};

const saveButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: 'white',
  color: 'var(--primary-color)',
  boxShadow: 'none',
  padding: '0.2em 0.8em'
};

export const CostCalcItemInputPage = withRouter(({history}) => {
  const {bulletCosts, inventory, bulletInventory, setActionButton, setInventory} = useContext(BulletCalculatorContext);
  const [inputInventory, setInputInventory] = useState(inventory);

  // バレット作成に必要な全コスト。
  // 全ての作成バレットの素材を合計して列挙する。
  // 所持バレット分の素材は除外する。
  const totalCosts = useMemo(
    () => {
      const combinedBulletInventory = combineDuplicatedInventoryBullets(bulletInventory);
      return totalBulletCosts(bulletCosts, combinedBulletInventory)
    },
    [bulletCosts, bulletInventory]
  );

  // 保存して戻る用のコールバック。
  const saveAndBack = useCallback((event: AnimationPlaybackEvent) => {
    setActionButton(undefined);
    setInventory(inputInventory);
    history.goBack();
  }, [history, inputInventory]);

  // 保存ボタン。
  const saveButton = useMemo(() => (
    <CardButton style={saveButtonStyle} onAnimationFinish={saveAndBack}>保存</CardButton>
  ),[saveAndBack]);

  // ページヘッダに保存ボタンを表示する。
  useEffect(() => {
    setActionButton(saveButton);
    return () => setActionButton(undefined);
  }, [saveButton, setActionButton]);

  // 入力欄を備えた、必要アイテムリスト。
  const requiredItemList = totalCosts.map((cost) => {
    const updateInputInventory = (event: React.FormEvent<HTMLInputElement>) => {
      const newInputInventory = {...inputInventory};
      const inputElem = (event.target as HTMLInputElement);

      if(inputElem.value) {
        // 数値以外が入力されているかもしれないので、
        // とりあえずパースしてみてダメだったらログ出しておく。
        const parsedInputValue = parseInt(inputElem.value);

        if(Number.isNaN(parsedInputValue)) {
          console.error('数値ではない無効な値が入力されています。');
        } else {
          newInputInventory[cost.item.slug] = parsedInputValue;
          setInputInventory(newInputInventory);
        }
      }
    };

    const inventoryQuantity = cost.item.slug in inventory ? inventory[cost.item.slug] : 0;

    return (
      <div key={cost.item.slug} style={costListItemStyle}>
        <img src={`img/${cost.item.iconFileName || 'treasure.svg'}`} style={costIconStyle}/>
        <div style={costNameStyle}>{cost.item.name.ja}</div>
        <div>
          <input
            type="number"
            pattern="\d*"
            min="0"
            step="1"
            defaultValue={cost.item.slug in inventory ? inventoryQuantity.toString() : ''}
            onInput={updateInputInventory}
            style={costInputStyle}/>
          個
        </div>
      </div>
    );
  });

  return (
    <div className="page">
      <Card style={cardStyle}>
        <h2 style={cardTitleStyle}>所持数入力</h2>
        <div style={costListStyle}>
          {requiredItemList}
        </div>
      </Card>
    </div>
  );
});