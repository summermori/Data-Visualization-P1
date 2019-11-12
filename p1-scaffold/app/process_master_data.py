import pandas as pd
import numpy as np
import sys

try:
    master_df = pd.read_csv('./data/master.csv')
except Exception as e:
    print("ERROR: " + e)
    print("Did you run this script from within the /app/ directory?")

print('Master Columns:')
print(list(master_df))
print('Age Groupings:')
print(master_df['age'].unique())

main_file = 'main.csv'
world_file = 'world_data.csv'
print('Output Filename: {}'.format(main_file))

grouping = ['country', 'year', 'age']
grp_df = master_df.groupby(grouping, as_index=False).agg({
            'suicides_no': np.sum,
            'population': np.sum,
            'suicides/100k pop': np.mean,
            'gdp_per_capita ($)': np.mean
            })

countries = set(['Republic of Korea','Japan'])
df = grp_df[grp_df['country'].isin(countries)]
#gdp = pd.Series(grp_df[['country', 'year', 'gdp']].gdp.unique())

streamable_raw = pd.pivot_table(df,
        values = 'suicides_no',
        index=['country','year'],
        columns='age').reset_index()

streamable_raw = streamable_raw.add_suffix('_raw')

streamable_norm = pd.pivot_table(df,
        values = 'suicides/100k pop',
        index=['country', 'year'],
        columns='age').reset_index()

streamable = pd.concat((streamable_norm, streamable_raw), axis=1)

streamable = streamable[['country', 'year',
    '5-14 years', '15-24 years', '25-34 years', '35-54 years', '55-74 years',
    '75+ years', '5-14 years_raw', '15-24 years_raw', '25-34 years_raw',
    '35-54 years_raw', '55-74 years_raw', '75+ years_raw']]

streamable.to_csv('./data/' + main_file, index=False)

countries_df = master_df.groupby(['country', 'year'], as_index=False).agg({
            'suicides/100k pop': np.mean,
            'gdp_per_capita ($)': np.mean
            })

world_df = master_df.groupby(['year'], as_index=False).agg({
            'suicides/100k pop': np.mean,
            'gdp_per_capita ($)': np.mean
            })
world_df['country'] = 'WORLD'
world_df = pd.concat((world_df , countries_df), axis=0)
print('Output Filename: {}'.format(world_file))
world_df.to_csv('./data/' + world_file, index=False)
