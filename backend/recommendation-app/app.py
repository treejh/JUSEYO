# app.py

from flask import Flask, request, jsonify
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

app = Flask(__name__)
# ============================================
# 🧠 1. 협업 필터링 추천
# ============================================
@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json  # [{userId: 1, itemName: '볼펜'}, ...]

    # JSON → DataFrame
    df = pd.DataFrame(data)

    # 사용자 x 품목 매트릭스
    matrix = pd.crosstab(df['userId'], df['itemName'])

    # 추천 받을 사용자 ID
    user_id = int(request.args.get('userId'))

    # 대상 사용자가 데이터에 없으면 빈 리스트 반환
    if user_id not in matrix.index:
        return jsonify([])

    # 유사도 계산
    similarity = cosine_similarity(matrix)
    target_idx = matrix.index.get_loc(user_id)
    similar_users = matrix.index[similarity[target_idx].argsort()[::-1][1:]]

    # 내가 사용한 품목
    used = set(matrix.loc[user_id][matrix.loc[user_id] > 0].index)

    # 비슷한 사용자가 쓴데 나는 안 쓴 품목 = 추천
    recommendations = set()
    for u in similar_users:
        items = set(matrix.loc[u][matrix.loc[u] > 0].index)
        recommendations |= (items - used)

    return jsonify(list(recommendations))

# ============================================
# 🧠 2. 연관 규칙 기반 추천 (Apriori, 사용자 기반)
# ============================================
@app.route('/recommend/association', methods=['POST'])
def association_recommend():
    data = request.json  # [{userId: 1, itemName: '볼펜'}, ...]

    # user_id 기준으로 트랜잭션 묶기
    transactions = {}
    for row in data:
        user_id = row['userId']
        item = row['itemName']
        transactions.setdefault(user_id, []).append(item)

    transaction_list = list(transactions.values())  # [['볼펜', '노트'], ['노트', '마우스']]

    if not transaction_list:
        return jsonify([])

    # One-hot 인코딩
    te = TransactionEncoder()
    te_ary = te.fit(transaction_list).transform(transaction_list)
    df_encoded = pd.DataFrame(te_ary, columns=te.columns_)

    # Apriori 분석 (조건 완화)
    frequent_itemsets = apriori(df_encoded, min_support=0.1, use_colnames=True)
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.2)




    item = request.args.get('itemName')
    target = frozenset([item])
    result = rules[rules['antecedents'] == target]

    recommended_items = [list(r)[0] for r in result['consequents']]
    return jsonify(recommended_items)

# 실행: http://localhost:5000/recommend
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
