class CreateArticleShares < ActiveRecord::Migration[7.1]
  def change
    create_table :article_shares, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.references :user,    null: false, foreign_key: true, type: :uuid
      t.references :article, null: false, foreign_key: true, type: :uuid
      t.string :platform, null: false, default: 'copy'

      t.timestamps null: false
    end
  end
end
